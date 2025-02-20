import { COLLECTIONS } from "enums";

import { db } from "config/firebase";
import { File } from "custom-types/File";

export default async function getLastUploaded(userId: string) {
  const filesSnapshot = await db
    .collection(COLLECTIONS.files)
    .where("ownerIds", "array-contains", userId)
    .orderBy("createdAt", "desc")
    .limit(4)
    .get();

  if (filesSnapshot.empty) {
    return [];
  }

  const files = filesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as File),
  }));

  return files;
}
