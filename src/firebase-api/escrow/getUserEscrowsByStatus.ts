import { db } from "config/firebase";

import { Escrow } from "custom-types/Escrow";
import { ESCROW_STATUSES, COLLECTIONS } from "enums";

export default async function getUserEscrowsByStatus(
  userId: string,
  status: ESCROW_STATUSES
): Promise<Escrow[]> {
  try {
    const escrowsRef = db.collection(COLLECTIONS.escrows);
    const snapshot = await escrowsRef
      .where("ownerId", "==", userId)
      .where("status", "==", status)
      .get();

    if (snapshot.empty) {
      console.log(`getUserEscrowsByStatus: ${userId}, snapshot empty`);
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
