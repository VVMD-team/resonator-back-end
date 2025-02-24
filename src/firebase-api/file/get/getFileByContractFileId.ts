import { COLLECTIONS } from "enums";

import { db } from "config/firebase";
import { File } from "custom-types/File";

export default async function getFileByContractFileId(fileContractId: string) {
  try {
    const fileQuery = await db
      .collection(COLLECTIONS.files)
      .where("fileContractId", "==", fileContractId)
      .get();

    if (fileQuery.empty) {
      console.error("Can not find file by fileContractId: ", fileContractId);
      throw new Error("Can not find file by fileContractId");
    }

    const fileDoc = fileQuery.docs[0];
    const fileData = fileDoc.data() as File;

    return { ...fileData, id: fileDoc.id };
  } catch (error) {
    throw new Error(`Something went wrong with getting file. Error: ${error}`);
  }
}
