import { COLLECTIONS } from "enums";

import { db } from "config/firebase";

import { ESCROW_FILE_STATUSES } from "enums";

type ChangeFileEscrowStatusProps = {
  fileId: string;
  escrowFileStatus: ESCROW_FILE_STATUSES;
};
export default async function changeFileEscrowStatus({
  fileId,
  escrowFileStatus,
}: ChangeFileEscrowStatusProps) {
  const fileRef = db.collection(COLLECTIONS.files).doc(fileId);
  const fileDoc = await fileRef.get();

  if (!fileDoc.exists) {
    throw new Error(`File with id: ${fileId} not exist`);
  }

  await fileRef.update({ escrowFileStatus });
}
