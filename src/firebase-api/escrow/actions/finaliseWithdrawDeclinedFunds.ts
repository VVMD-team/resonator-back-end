import { db } from "config/firebase";

import { COLLECTIONS } from "enums";

import checkIsOwnerUtil from "utils/escrow/checkIsOwnerUtil";

type FinaliseWithdrawDeclinedFundsData = {
  ownerId: string;
  escrowId: string;
};

export default async function finaliseWithdrawDeclinedFunds({
  ownerId,
  escrowId,
}: FinaliseWithdrawDeclinedFundsData) {
  try {
    const escrowRef = db.collection(COLLECTIONS.escrows).doc(escrowId);

    const escrowDoc = await escrowRef.get();

    if (!escrowDoc.exists) {
      throw new Error(`Escrow with ID ${escrowId} does not exist.`);
    }

    const [isOwner] = checkIsOwnerUtil(ownerId, escrowDoc);

    if (!isOwner) {
      console.error(
        `User with ID ${ownerId} is not the owner of escrow with ID ${escrowId}`
      );
      throw new Error(
        `Something went wrong with finaliseWithdrawDeclinedFunds.`
      );
    }

    await escrowRef.update({ isDeclinedFundsInContract: false });
  } catch (error) {
    throw new Error(
      `Something went wrong with finaliseWithdrawDeclinedFunds. Error: ${error}`
    );
  }
}
