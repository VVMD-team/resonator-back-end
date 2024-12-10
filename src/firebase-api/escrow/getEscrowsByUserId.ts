import { db } from "config/firebase";

import { Escrow } from "custom-types/Escrow";
import { COLLECTIONS } from "enums";

export default async function getEscrowsByUserId(
  userId: string
): Promise<Escrow[]> {
  try {
    const escrowsRef = db.collection(COLLECTIONS.escrows);
    const snapshot = await escrowsRef.where("ownerId", "==", userId).get();

    if (snapshot.empty) {
      console.log("No matching documents.");
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
