import { COLLECTIONS } from "enums";

import { db } from "config/firebase";
import { File } from "custom-types/File";

export default async function getFileById(fileId: string) {
  try {
    const fileDoc = await db.collection(COLLECTIONS.files).doc(fileId).get();
    if (fileDoc.exists) {
      const fileData = fileDoc.data() as File;

      const fileId = fileDoc?.id;

      return { ...fileData, id: fileId };
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(`Something went wrong with getting file. Error: ${error}`);
  }
}
