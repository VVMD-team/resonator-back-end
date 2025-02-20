import { COLLECTIONS } from "enums";
import { db } from "config/firebase";
import { File } from "custom-types/File";
import { removeFileIdFromBoxFileIds } from "firebase-api/box";

import { deleteFileFromStorage as deleteFileFromFirebaseStorage } from "storage/firebase";
import { deleteFilesFromStorage } from "storage/pinata";

import { ESCROW_FILE_STATUSES } from "enums";

type DeleteFileByIdProps = {
  fileId: string;
  userId: string;
};

export default async function deleteFileById({
  fileId,
  userId,
}: DeleteFileByIdProps) {
  try {
    const fileRef = db.collection(COLLECTIONS.files).doc(fileId);
    const fileDoc = await fileRef.get();

    if (!fileDoc.exists) {
      throw new Error("File does not exist.");
    }

    const file = fileDoc.data() as File;

    if (
      !file.ownerIds.includes(userId) ||
      file.escrowFileStatus === ESCROW_FILE_STATUSES.on_sell ||
      file.ownerIds.length > 1
    ) {
      throw new Error("Cannot delete file.");
    }

    await fileRef.delete();

    const isFileOld = !file.senderPublicKeyHex;

    if (isFileOld) {
      if (!file.filePath) return;
      await deleteFileFromFirebaseStorage(file.filePath);
    } else {
      await deleteFilesFromStorage([file.ipfsHash]);
    }

    await removeFileIdFromBoxFileIds({ userId, fileId });
  } catch (error) {
    throw new Error(`Something went wrong with deleting file. Error: ${error}`);
  }
}
