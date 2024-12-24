import { EscrowDTOShort, Escrow } from "custom-types/Escrow";

export default function mapEscrowToDTOShort(
  escrow: Escrow & { id: string }
): EscrowDTOShort | null {
  if (!escrow) {
    return null;
  }

  const escrowShort = {
    id: escrow.id,
    name: escrow.name,
  };

  return escrowShort;
}
