import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { getEscrowById, updateEscrowById } from "firebase-api/escrow";
import { escrowFinalizeSchema } from "schemas";
import {
  getFileByContractFileId,
  transferFileToAnotherUser,
  changeFileEscrowStatus,
} from "firebase-api/file";

import {
  BOX_TYPES,
  ESCROW_DEALS,
  ESCROW_STATUSES,
  ESCROW_FILE_STATUSES,
} from "enums";

import {
  EscrowFileToFunds,
  EscrowFileToFile,
  EscrowFundsToFile,
  // EscrowFundsToFunds,
} from "custom-types/Escrow";

import uploadEscrowFile from "utils/escrow/uploadEscrowFile";

import { ValidationError } from "yup";
import formatYupError from "helpers/yup/formatYupError";

import {
  finalizeFileCurrency,
  finalizeCurrencyFile,
  finalizeFileFile,
  finalizeCurrencyCurrency,
} from "contract-api/escrow-swap";

import createAndSendEscrowNotificationsToParticipants from "utils/escrow/createAndSendEscrowNotificationsToParticipants";

export default async function finalizeEscrow(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { escrowId, dealType, orderContractId } = req.body;

    const fileData = req.body.files?.[0];
    const fileOriginalName = fileData?.fileOriginalName;
    const fileMimeType = fileData?.fileMimeType;
    const fileContractId = fileData?.fileContractId;
    const fileSharedKey = fileData?.fileSharedKey;

    const payload = {
      escrowId,
      dealType,
      orderContractId,

      ...(fileOriginalName && { fileOriginalName }),
      ...(fileMimeType && { fileMimeType }),
      ...(fileContractId && { fileContractId }),
      ...(fileSharedKey && { fileSharedKey }),
    };

    await escrowFinalizeSchema.validate(payload);

    const escrow = await getEscrowById(escrowId);

    if (!escrow) {
      return res.status(404).send({ message: "Escrow not found" });
    }

    const userId = req.userId as string;

    if (escrow.counterpartyAddress.toLowerCase() !== userId.toLowerCase()) {
      return res
        .status(405)
        .send({ message: "You are not allowed to finalize this escrow" });
    }

    const providedFile = ((): Express.Multer.File | undefined => {
      if (
        dealType === ESCROW_DEALS.funds_to_file ||
        dealType === ESCROW_DEALS.file_to_file
      ) {
        const files = req.files as Express.Multer.File[];
        const file = files[0] as Express.Multer.File;

        return file;
      }
    })();

    let counterpartyFileNameForResponse = "";

    switch (dealType) {
      case ESCROW_DEALS.file_to_funds:
        const escrowFileToFunds = escrow as EscrowFileToFunds;

        if (!escrowFileToFunds.ownerData?.fileContractId) {
          throw new Error("File not found");
        }

        const fi_to_fu_owners_file = await getFileByContractFileId(
          escrowFileToFunds.ownerData.fileContractId
        );

        await finalizeFileCurrency(orderContractId);

        // Send file from owner to counterparty
        await transferFileToAnotherUser({
          senderUserId: escrowFileToFunds.ownerId,
          recipientWalletPublicKey: escrowFileToFunds.counterpartyAddress,
          fileId: fi_to_fu_owners_file.id,
          transferBoxType: BOX_TYPES.files_bought,
        });

        await changeFileEscrowStatus({
          fileId: fi_to_fu_owners_file.id,
          escrowFileStatus: ESCROW_FILE_STATUSES.sold,
        });

        await updateEscrowById({
          escrowId,
          status: ESCROW_STATUSES.completed,
        });

        break;
      case ESCROW_DEALS.funds_to_file:
        if (!providedFile) {
          return res.status(400).json({ error: "No file provided." });
        }

        const escrowFundsToFile = escrow as EscrowFundsToFile;

        if (!escrowFundsToFile.requestedCounterpartyData?.fileContractId) {
          throw new Error("File not found");
        }

        const fu_to_fi_counterparty_file = await uploadEscrowFile({
          userId,
          file: providedFile,
          fileMimeType,
          fileOriginalName,
          fileContractId,
          sharedKey: fileSharedKey,
          fileStatus: ESCROW_FILE_STATUSES.sold,
        });

        await finalizeCurrencyFile(orderContractId);

        // Send file from counterparty to owner
        await transferFileToAnotherUser({
          senderUserId: escrowFundsToFile.counterpartyAddress,
          recipientWalletPublicKey: escrowFundsToFile.ownerId,
          fileId: fu_to_fi_counterparty_file.id,
          transferBoxType: BOX_TYPES.files_bought,
        });

        await updateEscrowById({
          escrowId,
          status: ESCROW_STATUSES.completed,
          counterpartyFileName: fu_to_fi_counterparty_file.name,
        });

        counterpartyFileNameForResponse = fu_to_fi_counterparty_file.name;

        break;
      case ESCROW_DEALS.file_to_file:
        if (!providedFile) {
          return res.status(400).json({ error: "No file provided." });
        }

        const escrowFileToFile = escrow as EscrowFileToFile;

        if (!escrowFileToFile.ownerData?.fileContractId) {
          throw new Error("Owners's file not found");
        }
        if (!escrowFileToFile.requestedCounterpartyData?.fileContractId) {
          throw new Error("Counterparty's file not found");
        }

        await finalizeFileFile(orderContractId);

        const fi_to_fi_owners_file = await getFileByContractFileId(
          escrowFileToFile.ownerData.fileContractId
        );

        const fi_to_fi_counterparty_file = await uploadEscrowFile({
          userId,
          file: providedFile,
          fileMimeType,
          fileOriginalName,
          fileContractId,
          sharedKey: fileSharedKey,
          fileStatus: ESCROW_FILE_STATUSES.sold,
        });

        // Send file from owner to counterparty
        await transferFileToAnotherUser({
          senderUserId: escrowFileToFile.ownerId,
          recipientWalletPublicKey: escrowFileToFile.counterpartyAddress,
          fileId: fi_to_fi_owners_file.id,
          transferBoxType: BOX_TYPES.files_bought,
        });

        await changeFileEscrowStatus({
          fileId: fi_to_fi_owners_file.id,
          escrowFileStatus: ESCROW_FILE_STATUSES.sold,
        });

        // Send file from counterparty to owner
        await transferFileToAnotherUser({
          senderUserId: escrowFileToFile.counterpartyAddress,
          recipientWalletPublicKey: escrowFileToFile.ownerId,
          fileId: fi_to_fi_counterparty_file.id,
          transferBoxType: BOX_TYPES.files_bought,
        });

        await updateEscrowById({
          escrowId,
          status: ESCROW_STATUSES.completed,
          counterpartyFileName: fi_to_fi_counterparty_file.name,
        });

        counterpartyFileNameForResponse = fi_to_fi_counterparty_file.name;

        break;
      case ESCROW_DEALS.funds_to_funds:
        await finalizeCurrencyCurrency(orderContractId);

        await updateEscrowById({
          escrowId,
          status: ESCROW_STATUSES.completed,
        });

        break;
      default:
        return res
          .status(400)
          .send({ result: false, message: "Invalid Deal type" });
    }

    await createAndSendEscrowNotificationsToParticipants({
      ownerId: escrow.ownerId,
      counterpartyAddress: escrow.counterpartyAddress,
      escrowId: escrow.id,
      escrowName: escrow.name,
      escrowStatus: ESCROW_STATUSES.completed,
    });

    return res.status(200).send({
      result: true,
      status: ESCROW_STATUSES.completed,
      counterpartyFileName: counterpartyFileNameForResponse,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(formatYupError(error));
    }

    console.error("finalizeEscrow error: ", error);

    next(error);
  }
}
