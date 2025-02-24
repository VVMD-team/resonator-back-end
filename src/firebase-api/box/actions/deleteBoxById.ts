import { db } from "config/firebase";

import { COLLECTIONS } from "enums";

import { Box } from "custom-types/Box";
import { File } from "custom-types/File";

import { removeFileOwnerById, deleteFileById } from "firebase-api/file";

export default async function deleteBoxById(boxId: string, userId: string) {
  try {
    const boxRef = db.collection(COLLECTIONS.boxes).doc(boxId);
    const boxDoc = await boxRef.get();

    if (!boxDoc.exists) {
      throw new Error("Box does not exist.");
    }

    const boxData = boxDoc.data() as Box;

    if (boxData.ownerId !== userId) {
      throw new Error("Cannot delete box.");
    }

    const boxFileIds = boxData.fileIds;

    const filesPromises = boxFileIds.map(async (fileId) => {
      const fileRef = db.collection(COLLECTIONS.files).doc(fileId);

      const fileDoc = await fileRef.get();
      const fileData = fileDoc.data() as File;

      if (fileData.ownerIds.length > 1) {
        await removeFileOwnerById({ fileId, userId });
      } else {
        await deleteFileById({ fileId, userId });
      }
    });

    await Promise.all(filesPromises);

    await db.runTransaction(async (transaction) => {
      transaction.delete(boxRef);
    });

    return true;
  } catch (error) {
    throw new Error(`Something went wrong with deleting box. Error: ${error}`);
  }
}
