import { db } from "config/firebase";

import { COLLECTIONS } from "enums";
import { getBoxById } from "firebase-api/box";

import { File } from "custom-types/File";

export default async function updateBoxSize(boxId: string) {
  try {
    const box = await getBoxById(boxId);

    if (!box?.fileIds || !Array.isArray(box?.fileIds)) {
      throw new Error(
        `Box with ID ${boxId} does not have a valid fileIds array.`
      );
    }

    let totalSize = 0;

    const filePromises = box.fileIds.map(async (fileId) => {
      const fileRef = db.collection(COLLECTIONS.files).doc(fileId);
      const fileDoc = await fileRef.get();

      if (fileDoc.exists) {
        const fileData = fileDoc.data() as File;
        if (fileData?.size) {
          totalSize += fileData.size;
        }
      } else {
        throw new Error(`File with ID ${fileId} does not exist.`);
      }
    });

    await Promise.all(filePromises);

    await db
      .collection(COLLECTIONS.boxes)
      .doc(boxId)
      .update({ size: totalSize });
  } catch (error) {
    throw new Error(
      `Something went wrong with calculating box size. Error: ${error}`
    );
  }
}
