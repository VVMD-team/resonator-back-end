import { db } from "config/firebase";

import { COLLECTIONS } from "enums";

import checkIsOwnerUtil from "utils/escrow/checkIsOwnerUtil";

export default async function checkIsOwner(ownerId: string, escrowId: string) {
  const escrowRef = db.collection(COLLECTIONS.escrows).doc(escrowId);

  const escrowDoc = await escrowRef.get();

  if (!escrowDoc.exists) {
    throw new Error(`Escrow with ID ${escrowId} does not exist.`);
  }

  return checkIsOwnerUtil(ownerId, escrowDoc);
}
