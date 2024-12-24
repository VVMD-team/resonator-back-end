import { db } from "config/firebase";
import { ESCROW_STATUSES, COLLECTIONS } from "enums";
import { Escrow } from "custom-types/Escrow";

import { mapEscrowDoc } from "./helpers";

export default async function getCounterpartyActiveEscrows(
  userId: string
): Promise<(Escrow & { id: string })[]> {
  try {
    const counterpartyAddress = userId;

    const escrowsRef = db.collection(COLLECTIONS.escrows);

    const snapshot = await escrowsRef
      .where("counterpartyAddress", "==", counterpartyAddress)
      .where("status", "==", ESCROW_STATUSES.in_progress)
      .orderBy("createdAt", "desc")
      .get();

    if (snapshot.empty) {
      console.log(
        `getCounterpartyActiveEscrows: ${counterpartyAddress}, snapshot empty`
      );
      return [];
    }

    const escrows = snapshot.docs.map(mapEscrowDoc);

    return escrows;
  } catch (error) {
    console.error("Error getting escrows by counterpartyAddress:", error);
    throw new Error("Could not retrieve escrows");
  }
}
