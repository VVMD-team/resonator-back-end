import { COLLECTIONS } from "enums";

import { db } from "config/firebase";

export default async function setFileIdToBox(boxId: string, fileIds: string[]) {
  const boxDoc = await db.collection(COLLECTIONS.boxes).doc(boxId).get();
  if (!boxDoc.exists) {
    throw new Error(`Box with ID ${boxId} does not exist.`);
  }

  const boxData = boxDoc.data();

  const updatedFileIds = [...(boxData?.fileIds || []), ...fileIds].filter(
    (id, index, arr) => arr.indexOf(id) === index
  );

  await db
    .collection(COLLECTIONS.boxes)
    .doc(boxId)
    .update({ fileIds: updatedFileIds });
}
