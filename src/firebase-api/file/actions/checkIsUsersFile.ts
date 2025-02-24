import { COLLECTIONS } from "enums";
import { db } from "config/firebase";
import { File } from "custom-types/File";

export default async function checkIsUsersFile(fileId: string, userId: string) {
  const fileDoc = await db.collection(COLLECTIONS.files).doc(fileId).get();
  if (fileDoc.exists) {
    const fileData = fileDoc.data() as File;
    return fileData.ownerIds.includes(userId);
  } else {
    return false;
  }
}
