import { db } from "config/firebase";

import { Escrow } from "custom-types/Escrow";
import { Payment } from "custom-types/Payment";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { ESCROW_DEALS, ESCROW_STATUSES, COLLECTIONS } from "enums";

type CreateEscrowData = {
  ownerId: string;
  counterpartyAddress: string;
  name: string;
  description: string;
  dealType: ESCROW_DEALS;

  ownersFileId?: string;
  ownersPayment?: Payment;
  requestedCounterpartyPayment?: Payment;
};

export default async function createEscrow(data: CreateEscrowData) {
  try {
    const createdAt = FieldValue.serverTimestamp() as Timestamp;

    const basicData = {
      ...data,
      status: ESCROW_STATUSES.in_progress,
      createdAt,
    };

    let newEscrow: Escrow;

    switch (data.dealType) {
      case ESCROW_DEALS.file_to_funds:
        if (!data.ownersFileId || !data.requestedCounterpartyPayment) {
          throw new Error(
            "ownersFileId and requestedCounterpartyPayment are required for dealType file_to_funds"
          );
        }
        newEscrow = {
          ...basicData,
          dealType: ESCROW_DEALS.file_to_funds,
          ownerData: { fileId: data.ownersFileId },
          requestedCounterpartyData: {
            payment: data.requestedCounterpartyPayment,
          },
        };
        break;
      case ESCROW_DEALS.funds_to_file:
        if (!data.ownersPayment) {
          throw new Error(
            "ownersPayment is required for dealType funds_to_file"
          );
        }
        newEscrow = {
          ...basicData,
          dealType: ESCROW_DEALS.funds_to_file,
          ownerData: { payment: data.ownersPayment },
          requestedCounterpartyData: null,
        };
        break;
      case ESCROW_DEALS.file_to_file:
        if (!data.ownersFileId) {
          throw new Error("ownersFileId is required for dealType file_to_file");
        }
        newEscrow = {
          ...basicData,
          dealType: ESCROW_DEALS.file_to_file,
          ownerData: { fileId: data.ownersFileId },
          requestedCounterpartyData: null,
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

    console.log({ newEscrow });

    const docRef = await db.collection(COLLECTIONS.escrows).add(newEscrow);
    const escrowId = docRef.id;
    return { id: escrowId, ...newEscrow };
  } catch (error) {
    throw new Error(
      `Something went wrong with creating escrow. Error: ${error}`
    );
  }
}
