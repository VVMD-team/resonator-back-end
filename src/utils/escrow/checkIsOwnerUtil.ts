import { Escrow } from "custom-types/Escrow";

import { DocumentSnapshot } from "firebase-admin/firestore";

export default function checkIsOwnerUtil(
  ownerId: string,
  escrowDoc: DocumentSnapshot
): boolean {
  const escrowData = escrowDoc.data() as Escrow;

  return escrowData.ownerId === ownerId;
}
