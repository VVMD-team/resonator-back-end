import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";
import { createEscrow as createEscrowInDB } from "firebase-api/escrow";
import { setEscrowToUser } from "firebase-api/user";
import { getBoxesByUserIdAndType } from "firebase-api/box";

import { ESCROW_DEALS, BOX_TYPES, ESCROW_FILE_STATUSES } from "enums";

import { uploadFileSingle } from "utils/file/uploadFile";

import { CreateEscrowData } from "firebase-api/escrow";

import { escrowCreateSchema } from "schemas";
import { ValidationError } from "yup";
import formatYupError from "helpers/yup/formatYupError";

export default async function createEscrow(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      name,
      description,
      dealType,
      counterpartyAddress,
      counetrpartyCurrency,
      counetrpartyAmount,
      providedCurrency,
      providedAmount,
      fileOriginalName,
      fileMimeType,
    } = req.body;

    const file = req.file ? (req.file as Express.Multer.File) : undefined;

    const payload = {
      name,
      description,
      dealType,
      counterpartyAddress,
      ...(file ? { file } : {}),
      ...(counetrpartyCurrency && counetrpartyAmount
        ? {
            requestedPayment: {
              currency: counetrpartyCurrency,
              amount: counetrpartyAmount,
            },
          }
        : {}),
      ...(providedCurrency && providedAmount
        ? {
            previdedPayment: {
              currency: providedCurrency,
              amount: providedAmount,
            },
          }
        : {}),
    };

    await escrowCreateSchema.validate(payload);

    const userId = req.userId as string;

    const createEscrowData = {
      ownerId: userId,
      counterpartyAddress,
      name,
      description,
      dealType,
      createdAt: new Date().toISOString(),
    } as CreateEscrowData;

    if (
      dealType === ESCROW_DEALS.file_to_funds ||
      dealType === ESCROW_DEALS.file_to_file
    ) {
      if (!file) return;

      const filesForSellBoxes = await getBoxesByUserIdAndType(
        userId,
        BOX_TYPES.files_for_sell
      );

      if (filesForSellBoxes.length === 0) {
        console.error(`User do not have files_for_sell box. userId: ${userId}`);
        throw new Error("User do not have files_for_sell box.");
      }

      if (filesForSellBoxes.length > 1) {
        console.error(
          `User has more than one files_for_sell box. userId: ${userId}`
        );

        throw new Error("User has more than one files_for_sell box.");
      }

      const { id: filesForSellBoxId } = filesForSellBoxes[0];

      if (!fileMimeType || !fileOriginalName) {
        res
          .status(400)
          .send({ message: "File mimetype and original name required" });
      }

      const addedFile = await uploadFileSingle({
        file,
        fileRequestData: {
          mimetype: fileMimeType,
          originalName: fileOriginalName,
        },
        userId,
        isCheckSize: false,
        boxId: filesForSellBoxId,
        escrowFileStatus: ESCROW_FILE_STATUSES.created,
      });

      createEscrowData.ownersFileId = addedFile.id;
    }

    if (
      dealType === ESCROW_DEALS.funds_to_file ||
      dealType === ESCROW_DEALS.funds_to_funds
    ) {
      createEscrowData.ownersPayment = {
        amount: Number(providedAmount),
        currency: providedCurrency,
      };
    }

    if (
      dealType === ESCROW_DEALS.file_to_funds ||
      dealType === ESCROW_DEALS.funds_to_funds
    ) {
      createEscrowData.requestedCounterpartyPayment = {
        amount: Number(counetrpartyAmount),
        currency: counetrpartyCurrency,
      };
    }

    const newEscrow = await createEscrowInDB(createEscrowData);

    await setEscrowToUser(newEscrow.id, userId);

    return res.status(200).send(newEscrow);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(formatYupError(error));
    }

    next(error);
  }
}
