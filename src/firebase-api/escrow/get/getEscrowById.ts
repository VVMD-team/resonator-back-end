import { db } from "config/firebase";
import { Escrow } from "custom-types/Escrow";
import { COLLECTIONS } from "enums";

export default async function getEscrowById(
  escrowId: string
): Promise<(Escrow & { id: string }) | null> {
  try {
    const escrowDoc = await db
      .collection(COLLECTIONS.escrows)
      .doc(escrowId)
      .get();

    if (!escrowDoc.exists) {
      console.log(`getEscrowById: ${escrowId}, document not found`);
      return null;
    }

    const escrowData = escrowDoc.data() as Escrow;

    return { ...escrowData, id: escrowDoc.id };
  } catch (error) {
    console.error("Error getting escrow by ID:", error);
    throw new Error("Could not retrieve escrow");
  }
}
