import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";
import { createEscrow as createEscrowInDB } from "firebase-api/escrow";
import { setEscrowToUser, getUserById } from "firebase-api/user";

import { ESCROW_DEALS, ESCROW_FILE_STATUSES } from "enums";

import { CreateEscrowData } from "firebase-api/escrow";
import uploadEscrowFile from "utils/escrow/uploadEscrowFile";

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
      contractOrderHash,
      name,
      description,
      dealType,
      counterpartyAddress,
      requestedPayment: requestedPaymentField,
      providedPayment: providedPaymentField,
      counterpartyFileContractId,
      // counterpartyFileName,
    } = req.body;
    const counterpartyAddressFormatted = counterpartyAddress.toLowerCase();

    const requestedPayment =
      requestedPaymentField && JSON.parse(requestedPaymentField);
    const providedPayment =
      providedPaymentField && JSON.parse(providedPaymentField);

    const fileData = req.body.files?.[0];
    const fileOriginalName = fileData?.fileOriginalName;
    const fileMimeType = fileData?.fileMimeType;
    const fileContractId = fileData?.fileContractId;
    const fileSharedKey = fileData?.fileSharedKey;

    const payload = {
      contractOrderHash,
      name,
      description,
      dealType,
      counterpartyAddress: counterpartyAddressFormatted,
      ...(counterpartyFileContractId && { counterpartyFileContractId }),
      // ...(counterpartyFileName && { counterpartyFileName }),
      ...(requestedPayment && { requestedPayment }),
      ...(providedPayment && { providedPayment }),

      ...(fileOriginalName && { fileOriginalName }),
      ...(fileMimeType && { fileMimeType }),
      ...(fileContractId && { fileContractId }),
      ...(fileSharedKey && { fileSharedKey }),
    };
    await escrowCreateSchema.validate(payload);

    const userId = req.userId as string;
    if (userId.toLowerCase() === counterpartyAddressFormatted) {
      throw new Error("You can not create escrow with yourself");
    }

    const counterpartyUser = await getUserById(counterpartyAddressFormatted);
    if (!counterpartyUser) {
      throw new Error("Counterparty not found");
    }

    const createEscrowData = {
      contractOrderHash,
      ownerId: userId,
      counterpartyAddress: counterpartyAddressFormatted,
      name,
      description,
      dealType,
      createdAt: new Date().toISOString(),
    } as CreateEscrowData;

    if (
      dealType === ESCROW_DEALS.file_to_funds ||
      dealType === ESCROW_DEALS.file_to_file
    ) {
      const files = req.files as Express.Multer.File[];
      const file = files[0];

      if (!file) {
        return res.status(400).json({ error: "No file provided." });
      }

      const ownersFile = await uploadEscrowFile({
        userId,
        file,
        fileMimeType,
        fileOriginalName,
        fileContractId,
        sharedKey: fileSharedKey,
        fileStatus: ESCROW_FILE_STATUSES.on_sell,
      });

      createEscrowData.ownersfileContractId = ownersFile.fileContractId;
      createEscrowData.ownersFileName = ownersFile.name;
    }

    if (
      dealType === ESCROW_DEALS.funds_to_file ||
      dealType === ESCROW_DEALS.funds_to_funds
    ) {
      createEscrowData.ownersPayment = {
        amount: providedPayment.amount,
        currency: providedPayment.currency,
      };
    }

    if (
      dealType === ESCROW_DEALS.file_to_funds ||
      dealType === ESCROW_DEALS.funds_to_funds
    ) {
      createEscrowData.requestedCounterpartyPayment = {
        amount: requestedPayment.amount,
        currency: requestedPayment.currency,
      };
    }

    if (
      dealType === ESCROW_DEALS.funds_to_file ||
      dealType === ESCROW_DEALS.file_to_file
    ) {
      createEscrowData.counterpartyFileContractId = counterpartyFileContractId;
      // createEscrowData.counterpartyFileName = counterpartyFileName;
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
