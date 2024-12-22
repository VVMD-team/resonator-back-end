import { db } from "config/firebase";
import { ESCROW_STATUSES, COLLECTIONS } from "enums";
import { Escrow } from "custom-types/Escrow";

import { mapEscrowDoc } from "./helpers";

export default async function getHistory(
  userId: string
): Promise<(Escrow & { id: string })[]> {
  try {
    const escrowsRef = db.collection(COLLECTIONS.escrows);

    const allowedStatuses = Object.values(ESCROW_STATUSES).filter(
      (status) => status !== ESCROW_STATUSES.in_progress
    );

    const baseQueryByStatus = escrowsRef.where("status", "in", allowedStatuses);
    const snapshot1 = await baseQueryByStatus
      .where("ownerId", "==", userId)
      .get();
    const snapshot2 = await baseQueryByStatus
      .where("counterpartyAddress", "==", userId)
      .get();

    if (snapshot1.empty && snapshot2.empty) {
      console.log(`getHistory: ${userId}, snapshots are empty`);
      return [];
    }

    const escrows = [
      ...snapshot1.docs.map(mapEscrowDoc),
      ...snapshot2.docs.map(mapEscrowDoc),
    ];

    const sortedEscrows = escrows.sort(
      (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()
    );

    return sortedEscrows;
  } catch (error) {
    console.error("Error getting escrows history:", error);
    throw new Error("Could not retrieve escrows");
  }
}
