import { Escrow } from "custom-types/Escrow";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

export default function mapEscrowDoc(
  doc: QueryDocumentSnapshot
): Escrow & { id: string } {
  const escrow = doc.data() as Escrow;

  return { ...escrow, id: doc.id };
}
