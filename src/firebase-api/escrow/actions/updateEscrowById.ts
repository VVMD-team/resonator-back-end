import { COLLECTIONS, ESCROW_STATUSES, ESCROW_DEALS } from "enums";
import { Escrow } from "custom-types/Escrow";
import { db } from "config/firebase";

type UpdateEscrowByIdData = {
  escrowId: string;
  status?: ESCROW_STATUSES;
  counterpartyFileName?: string;
};

export default async function updateEscrowById({
  escrowId,
  status,
  counterpartyFileName,
}: UpdateEscrowByIdData) {
  try {
    const escrowRef = db.collection(COLLECTIONS.escrows).doc(escrowId);

    if (counterpartyFileName) {
      const escrowDoc = await escrowRef.get();
      if (!escrowDoc.exists) {
        throw new Error(`Escrow with ID ${escrowId} does not exist.`);
      }
      const escrowData = escrowDoc.data() as Escrow;
      if (
        escrowData.dealType === ESCROW_DEALS.file_to_funds ||
        escrowData.dealType === ESCROW_DEALS.funds_to_funds
      ) {
        console.error(
          `Invalid argument. counterpartyFileName can be used only with dealTypes ${ESCROW_DEALS.file_to_file} or ${ESCROW_DEALS.funds_to_file}.`
        );
        throw new Error("Something went wrong.");
      }
    }

    await escrowRef.update({
      ...(status && { status }),
      ...(counterpartyFileName && {
        counterpartyData: { fileName: counterpartyFileName },
      }),
    });
  } catch (error) {
    throw new Error(`Something went wrong with updating file. Error: ${error}`);
  }
}
