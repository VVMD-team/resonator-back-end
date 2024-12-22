import { db } from "config/firebase";
import { Escrow } from "custom-types/Escrow";
import { COLLECTIONS } from "enums";

import { mapEscrowDoc } from "./helpers";

export default async function getEscrowById(escrowId: string): Promise<Escrow | null> {
    try {
        const escrowDoc = await db.collection(COLLECTIONS.escrows).doc(escrowId).get();

        if (!escrowDoc.exists) {
            console.log(`getEscrowById: ${escrowId}, document not found`);
            return null;
        }

        return mapEscrowDoc(escrowDoc);
    } catch (error) {
        console.error("Error getting escrow by ID:", error);
        throw new Error("Could not retrieve escrow");
    }
}
