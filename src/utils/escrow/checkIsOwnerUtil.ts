import { Escrow } from "custom-types/Escrow";

import { DocumentSnapshot } from "firebase-admin/firestore";

export default async function checkIsOwnerUtil(
  ownerId: string,
  escrowDoc: DocumentSnapshot
) {
  const escrowData = escrowDoc.data() as Escrow;

  return escrowData.ownerId === ownerId;
}
