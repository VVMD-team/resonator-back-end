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

  fileOfferedId?: string;
  paymentRequested?: Payment;
  paymentOffered?: Payment;
};

export default async function createEscrow(data: CreateEscrowData) {
  try {
    const basicData = {
      ...data,
      status: ESCROW_STATUSES.in_progress,
      createdAt: FieldValue.serverTimestamp() as Timestamp,
    };

    let newEscrow: Escrow;

    switch (data.dealType) {
      case ESCROW_DEALS.file_to_funds:
        if (!data.fileOfferedId || !data.paymentRequested) {
          throw new Error(
            "fileOfferedId and paymentRequested are required for dealType file_to_funds"
          );
        }
        newEscrow = {
          ...basicData,
          dealType: ESCROW_DEALS.file_to_funds,
          fileOfferedId: data.fileOfferedId,
          paymentRequested: data.paymentRequested,
        };
        break;
      case ESCROW_DEALS.funds_to_file:
        if (!data.paymentOffered) {
          throw new Error(
            "paymentOffered is required for dealType funds_to_file"
          );
        }
        newEscrow = {
          ...basicData,
          dealType: ESCROW_DEALS.funds_to_file,
          paymentOffered: data.paymentOffered,
        };
        break;
      case ESCROW_DEALS.file_to_file:
        if (!data.fileOfferedId) {
          throw new Error(
            "fileOfferedId is required for dealType file_to_file"
          );
        }
        newEscrow = {
          ...basicData,
          dealType: ESCROW_DEALS.file_to_file,
          fileOfferedId: data.fileOfferedId,
        };
        break;
      case ESCROW_DEALS.funds_to_funds:
        if (!data.paymentOffered || !data.paymentRequested) {
          throw new Error(
            "paymentOffered and paymentRequested are required for dealType funds_to_funds"
          );
        }
        newEscrow = {
          ...basicData,
          dealType: ESCROW_DEALS.funds_to_funds,
          paymentOffered: data.paymentOffered,
          paymentRequested: data.paymentRequested,
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
