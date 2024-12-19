import { db } from "config/firebase";

import { COLLECTIONS } from "enums";

import checkIsOwnerUtil from "utils/escrow/checkIsOwnerUtil";

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

    throw new Error("Coming soon!");

    // TODO: implement cancel escrow by owner
  } catch (error) {
    throw new Error(
      `Something went wrong with declining escrow. Error: ${error}`
    );
  }
}
