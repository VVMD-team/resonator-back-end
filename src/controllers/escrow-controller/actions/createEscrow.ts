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

import createAndSendEscrowNotificationsToParticipants from "utils/escrow/createAndSendEscrowNotificationsToParticipants";

export default async function createEscrow(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const {
      fileEncryptedIvBase64,
      fileEncryptedAesKeys: fileEncryptedAesKeysField,
      fileSenderPublicKeyHex,
      fileOriginalName,
      fileMimeType,

      fileContractId,
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
    const fileEncryptedAesKeys =
      fileEncryptedAesKeysField && JSON.parse(fileEncryptedAesKeysField);
    const requestedPayment =
      requestedPaymentField && JSON.parse(requestedPaymentField);
    const providedPayment =
      providedPaymentField && JSON.parse(providedPaymentField);

    const counterpartyAddressFormatted = counterpartyAddress.toLowerCase();

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

      ...(fileEncryptedIvBase64 && { fileEncryptedIvBase64 }),
      ...(fileEncryptedAesKeys && { fileEncryptedAesKeys }),
      ...(fileSenderPublicKeyHex && { fileSenderPublicKeyHex }),
      ...(fileOriginalName && { fileOriginalName }),
      ...(fileMimeType && { fileMimeType }),
      ...(fileContractId && { fileContractId }),
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
      const encryptedFile = req.file
        ? (req.file as Express.Multer.File)
        : undefined;

      if (!encryptedFile) {
        return res.status(400).send({ message: "File is required" });
      }

      const ownersFile = await uploadEscrowFile({
        userId,
        file: encryptedFile,
        fileMimeType,
        fileOriginalName,
        fileContractId,
        fileStatus: ESCROW_FILE_STATUSES.on_sell,

        encryptedIvBase64: fileEncryptedIvBase64,
        encryptedAesKeys: fileEncryptedAesKeys,
        senderPublicKeyHex: fileSenderPublicKeyHex,
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

    await createAndSendEscrowNotificationsToParticipants({
      ownerId: newEscrow.ownerId,
      counterpartyAddress: newEscrow.counterpartyAddress,
      escrowId: newEscrow.id,
      escrowName: newEscrow.name,
      escrowStatus: newEscrow.status,
    });

    return res.status(200).send(newEscrow);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(formatYupError(error));
    }

    next(error);
  }
}
