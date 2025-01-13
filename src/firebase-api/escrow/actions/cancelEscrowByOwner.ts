import { db } from "config/firebase";

import { COLLECTIONS, ESCROW_STATUSES, ESCROW_DEALS } from "enums";

import checkIsOwnerUtil from "utils/escrow/checkIsOwnerUtil";

import { Escrow } from "custom-types/Escrow";

type CancelEscrowByOwnerData = {
  ownerId: string;
  escrowId: string;
};

export default async function cancelEscrowByOwner({
  ownerId,
  escrowId,
}: CancelEscrowByOwnerData) {
  try {
    const escrowRef = db.collection(COLLECTIONS.escrows).doc(escrowId);

    const escrowDoc = await escrowRef.get();

    if (!escrowDoc.exists) {
      throw new Error(`Escrow with ID ${escrowId} does not exist.`);
    }

    const isOwner = checkIsOwnerUtil(ownerId, escrowDoc);

    if (!isOwner) {
      console.error(
        `User with ID ${ownerId} is not the owner of escrow with ID ${escrowId}`
      );
      throw new Error(`Something went wrong with declining escrow.`);
    }

    const status = ESCROW_STATUSES.canceled_by_owner;
    const escrowData = escrowDoc.data() as Escrow;

    if (escrowData.status === status) {
      throw new Error(`Escrow with ID ${escrowId} has already been canceled.`);
    }

    const updateData = {
      status,
      ...(escrowData.dealType !== ESCROW_DEALS.file_to_file && {
        isDeclinedFundsInContract: true,
      }),
    };

    await escrowRef.update(updateData);

    return status;
  } catch (error) {
    throw new Error(
      `Something went wrong with declining escrow. Error: ${error}`
    );
  }
}
