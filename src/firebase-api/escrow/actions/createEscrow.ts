import { db } from "config/firebase";

import { Escrow } from "custom-types/Escrow";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { ESCROW_DEALS, ESCROW_STATUSES, COLLECTIONS } from "enums";

import CreateEscrowData from "./types/CreateEscrowData";

export default async function createEscrow(data: CreateEscrowData) {
  try {
    const createdAt = FieldValue.serverTimestamp() as Timestamp;

    const basicData = {
      contractOrderHash: data.contractOrderHash,
      ownerId: data.ownerId,
      counterpartyAddress: data.counterpartyAddress,
      name: data.name,
      description: data.description,
      dealType: data.dealType,
      isDeclinedFundsInContract: false,
      status: ESCROW_STATUSES.in_progress,
      createdAt,
    };

    let newEscrow: Escrow;

    switch (data.dealType) {
      case ESCROW_DEALS.file_to_funds:
        if (
          !data.ownersfileContractId ||
          !data.ownersFileName ||
          !data.requestedCounterpartyPayment
        ) {
          throw new Error(
            "ownersfileContractId, ownersFileName, requestedCounterpartyPayment are required for dealType file_to_funds"
          );
        }
        newEscrow = {
          ...basicData,
          dealType: ESCROW_DEALS.file_to_funds,
          ownerData: {
            fileContractId: data.ownersfileContractId,
            fileName: data.ownersFileName,
          },
          requestedCounterpartyData: {
            payment: data.requestedCounterpartyPayment,
          },
        };
        break;
      case ESCROW_DEALS.funds_to_file:
        if (
          !data.ownersPayment ||
          !data.counterpartyFileContractId
          // !data.counterpartyFileName
        ) {
          throw new Error(
            "ownersPayment, counterpartyFileContractId are required for dealType funds_to_file"
          );
        }
        newEscrow = {
          ...basicData,
          dealType: ESCROW_DEALS.funds_to_file,
          ownerData: { payment: data.ownersPayment },
          requestedCounterpartyData: {
            fileContractId: data.counterpartyFileContractId,
            fileName: "File",
          },
        };
        break;
      case ESCROW_DEALS.file_to_file:
        if (
          !data.ownersfileContractId ||
          !data.ownersFileName ||
          !data.counterpartyFileContractId
          // !data.counterpartyFileName
        ) {
          throw new Error(
            "ownersfileContractId, ownersFileName, counterpartyFileContractId are required for dealType file_to_file"
          );
        }
        newEscrow = {
          ...basicData,
          dealType: ESCROW_DEALS.file_to_file,
          ownerData: {
            fileContractId: data.ownersfileContractId,
            fileName: data.ownersFileName,
          },
          requestedCounterpartyData: {
            fileContractId: data.counterpartyFileContractId,
            fileName: "File",
          },
        };
        break;
      case ESCROW_DEALS.funds_to_funds:
        if (!data.ownersPayment || !data.requestedCounterpartyPayment) {
          throw new Error(
            "ownersPayment and requestedCounterpartyPayment are required for dealType funds_to_funds"
          );
        }
        newEscrow = {
          ...basicData,
          dealType: ESCROW_DEALS.funds_to_funds,
          ownerData: { payment: data.ownersPayment },
          requestedCounterpartyData: {
            payment: data.requestedCounterpartyPayment,
          },
        };
        break;
      default:
        throw new Error("Invalid deal type");
    }

    const docRef = await db.collection(COLLECTIONS.escrows).add(newEscrow);
    const escrowId = docRef.id;
    return { id: escrowId, ...newEscrow };
  } catch (error) {
    throw new Error(
      `Something went wrong with creating escrow. Error: ${error}`
    );
  }
}
