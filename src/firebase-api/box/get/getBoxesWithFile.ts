import { db } from "config/firebase";

import { COLLECTIONS } from "enums";

export default async function getBoxesWithFile(fileId: string, userId: string) {
  const boxSnapshots = await db
    .collection(COLLECTIONS.boxes)
    .where("ownerId", "==", userId)
    .where("fileIds", "array-contains", fileId)
    .get();

  const boxIds: string[] = boxSnapshots.docs.map((doc) => doc.id);
  return boxIds;
}
