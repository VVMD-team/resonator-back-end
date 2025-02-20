import { COLLECTIONS } from "enums";
import { db } from "config/firebase";
import { File } from "custom-types/File";

import { removeFileIdFromBoxFileIds } from "firebase-api/box";

import { ESCROW_FILE_STATUSES } from "enums";

type RemoveFileOwnerByIdProps = {
  fileId: string;
  userId: string;
};

export default async function removeFileOwnerById({
  fileId,
  userId,
}: RemoveFileOwnerByIdProps) {
  try {
    const fileRef = db.collection(COLLECTIONS.files).doc(fileId);
    const fileDoc = await fileRef.get();

    if (!fileDoc.exists) {
      throw new Error("File does not exist.");
    }

    const file = fileDoc.data() as File;

    if (
      !file.ownerIds.includes(userId) ||
      file.escrowFileStatus === ESCROW_FILE_STATUSES.on_sell
    ) {
      throw new Error("Cannot delete file.");
    }

    if (file.ownerIds.length === 1) {
      throw new Error("Cannot remove last owner.");
    }

    const updatedOwnerIds = file.ownerIds.filter((id) => id !== userId);

    await fileRef.update({
      ownerIds: updatedOwnerIds,
    });

    await removeFileIdFromBoxFileIds({ userId, fileId });
  } catch (error) {
    throw new Error(`Something went wrong with deleting file. Error: ${error}`);
  }
}
