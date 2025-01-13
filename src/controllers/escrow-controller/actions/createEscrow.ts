import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";
import { createEscrow as createEscrowInDB } from "firebase-api/escrow";
import { setEscrowToUser, getUserById } from "firebase-api/user";
import { getFileByContractFileId } from "firebase-api/file";

import { ESCROW_DEALS } from "enums";

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
      contractOrderHash,
      name,
      description,
      dealType,
      counterpartyAddress,
      requestedPayment,
      providedPayment,
      fileContractId,
      counterpartyFileContractId,
      counterpartyFileName,
    } = req.body;

    const counterpartyAddressFormatted = counterpartyAddress.toLowerCase();

    const payload = {
      contractOrderHash,
      name,
      description,
      dealType,
      counterpartyAddress: counterpartyAddressFormatted,
      ...(fileContractId && { fileContractId }),
      ...(counterpartyFileContractId && { counterpartyFileContractId }),
      ...(counterpartyFileName && { counterpartyFileName }),
      ...(requestedPayment && { requestedPayment }),
      ...(providedPayment && { providedPayment }),
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
      if (!fileContractId) return;

      const ownersFile = await getFileByContractFileId(fileContractId);

      createEscrowData.ownersfileContractId = fileContractId;
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
      createEscrowData.counterpartyFileName = counterpartyFileName;
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
