import { db } from "config/firebase";

import { COLLECTIONS, ESCROW_STATUSES } from "enums";

import checkIsCounterpartyUtil from "utils/escrow/checkIsCounterpartyUtil";

type CancelEscrowByCounterpartyData = {
  counterpartyId: string;
  escrowId: string;
};

export default async function cancelEscrowByCounterparty({
  counterpartyId,
  escrowId,
}: CancelEscrowByCounterpartyData) {
  try {
    const escrowRef = db.collection(COLLECTIONS.escrows).doc(escrowId);

    const escrowDoc = await escrowRef.get();

    if (!escrowDoc.exists) {
      throw new Error(`Escrow with ID ${escrowId} does not exist.`);
    }

    const isCounterparty = checkIsCounterpartyUtil(counterpartyId, escrowDoc);

    if (!isCounterparty) {
      console.error(
        `User with ID ${counterpartyId} is not the counterparty of escrow with ID ${escrowId}`
      );
      throw new Error(`Something went wrong with declining escrow.`);
    }

    await escrowRef.update({
      status: ESCROW_STATUSES.canceled_by_counterparty,
    });
  } catch (error) {
    throw new Error(
      `Something went wrong with declining escrow. Error: ${error}`
    );
  }
}
