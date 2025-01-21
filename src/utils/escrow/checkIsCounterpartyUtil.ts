import { Escrow } from "custom-types/Escrow";

import { DocumentSnapshot } from "firebase-admin/firestore";

export default function checkIsCounterpartyUtil(
  counterpartyId: string,
  escrowDoc: DocumentSnapshot
): [boolean, Escrow & { id: string }] {
  const escrowData = escrowDoc.data() as Escrow;

  return [
    escrowData.counterpartyAddress.toLowerCase() ===
      counterpartyId.toLowerCase(),
    { ...escrowData, id: escrowDoc.id },
  ];
}
