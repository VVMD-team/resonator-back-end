import { db } from "config/firebase";
import {
  EscrowFileToFunds,
  EscrowFundsToFile,
  EscrowFileToFile,
  // EscrowFundsToFunds,
} from "custom-types/Escrow";
import { COLLECTIONS, ESCROW_DEALS } from "enums";

import { getFileByContractFileId } from "firebase-api/file";

type CheckEscrowValidityData = {
  escrowId: string;
  dealType: ESCROW_DEALS;
};

export default async function checkEscrowValidity({
  escrowId,
  dealType,
}: CheckEscrowValidityData) {
  try {
    const escrowDoc = await db
      .collection(COLLECTIONS.escrows)
      .doc(escrowId)
      .get();

    if (!escrowDoc.exists) {
      throw new Error("escrow does not exist");
    }

    switch (dealType) {
      case ESCROW_DEALS.file_to_funds:
        const fi_to_fu_escrow_data = escrowDoc.data() as EscrowFileToFunds;

        const fi_to_fu_owners_file_contract_id =
          fi_to_fu_escrow_data.ownerData.fileContractId;

        const fi_to_fu_file = await getFileByContractFileId(
          fi_to_fu_owners_file_contract_id
        );

        if (!fi_to_fu_file) {
          throw new Error("File not found");
        }

        if (fi_to_fu_file.name !== fi_to_fu_escrow_data.ownerData.fileName) {
          throw new Error("File name does not match");
        }
        break;
      case ESCROW_DEALS.funds_to_file:
        const fu_to_fi_escrow_data = escrowDoc.data() as EscrowFundsToFile;

        const fu_to_fi_counterparty_file_contract_id =
          fu_to_fi_escrow_data.requestedCounterpartyData.fileContractId;

        const fu_to_fi_counterparty_file = await getFileByContractFileId(
          fu_to_fi_counterparty_file_contract_id
        );

        if (!fu_to_fi_counterparty_file) {
          throw new Error("counterparty's file not found");
        }

        if (
          fu_to_fi_counterparty_file.name !==
          fu_to_fi_escrow_data.requestedCounterpartyData.fileName
        ) {
          throw new Error("counterparty's file name does not match");
        }

        break;
      case ESCROW_DEALS.file_to_file:
        const fi_to_fi_escrow_data = escrowDoc.data() as EscrowFileToFile;

        const fi_to_fi_owners_file_contract_id =
          fi_to_fi_escrow_data.ownerData.fileContractId;

        const fi_to_fi_file = await getFileByContractFileId(
          fi_to_fi_owners_file_contract_id
        );

        if (!fi_to_fi_file) {
          throw new Error("owner's file not found");
        }

        if (fi_to_fi_file.name !== fi_to_fi_escrow_data.ownerData.fileName) {
          throw new Error("owner's file name does not match");
        }

        const fi_to_fi_counterparty_file_contract_id =
          fi_to_fi_escrow_data.requestedCounterpartyData.fileContractId;

        const fi_to_fi_counterparty_file = await getFileByContractFileId(
          fi_to_fi_counterparty_file_contract_id
        );

        if (!fi_to_fi_counterparty_file) {
          throw new Error("counterparty's file not found");
        }

        if (
          fi_to_fi_counterparty_file.name !==
          fi_to_fi_escrow_data.requestedCounterpartyData.fileName
        ) {
          throw new Error("counterparty's file name does not match");
        }

        break;
      case ESCROW_DEALS.funds_to_funds:
        // const fu_to_fu_escrow_data = escrowDoc.data() as EscrowFundsToFunds;
        break;
      default:
        throw new Error("Invalid deal type");
    }
  } catch (error) {
    console.error("Error checking escrow by ID:", error);
    const err = error as any;
    throw new Error(err);
  }
}
