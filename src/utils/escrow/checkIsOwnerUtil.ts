import { Escrow } from "custom-types/Escrow";

import { DocumentSnapshot } from "firebase-admin/firestore";

export default function checkIsOwnerUtil(
  ownerId: string,
  escrowDoc: DocumentSnapshot
): [boolean, Escrow & { id: string }] {
  const escrowData = escrowDoc.data() as Escrow;

  return [escrowData.ownerId === ownerId, { ...escrowData, id: escrowDoc.id }];
}
