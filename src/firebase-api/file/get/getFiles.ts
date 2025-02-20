import { COLLECTIONS } from "enums";

import { db } from "config/firebase";
import { File } from "custom-types/File";

export default async function getFiles(userId: string) {
  try {
    const filesSnapshot = await db
      .collection(COLLECTIONS.files)
      .where("ownerIds", "array-contains", userId)
      .get();

    if (filesSnapshot.empty) {
      return [];
    }

    const files = filesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as File),
    }));

    return files;
  } catch (error) {
    throw new Error(
      `Something went wrong with getting all files.  Error: ${error}`
    );
  }
}
