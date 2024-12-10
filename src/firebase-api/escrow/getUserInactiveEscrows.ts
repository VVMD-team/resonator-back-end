import { db } from "config/firebase";

import { Escrow } from "custom-types/Escrow";
import { ESCROW_STATUSES, COLLECTIONS } from "enums";

export default async function getUserInactiveEscrows(
  userId: string
): Promise<Escrow[]> {
  try {
    const allowedStatuses = Object.values(ESCROW_STATUSES).filter(
      (status) => status !== ESCROW_STATUSES.in_progress
    );

    const escrowsRef = db.collection(COLLECTIONS.escrows);
    const snapshot = await escrowsRef
      .where("ownerId", "==", userId)
      .where("status", "in", allowedStatuses)
      .get();

    if (snapshot.empty) {
      console.log(`getUserInactiveEscrows: ${userId}, snapshot empty`);
      return [];
    }

    const escrows = snapshot.docs.map((doc) => {
      const escrow = doc.data() as Escrow;

      return { ...escrow, id: doc.id };
    });
    return escrows;
  } catch (error) {
    console.error("Error getting escrows by user id:", error);
    throw new Error("Could not retrieve escrows");
  }
}
