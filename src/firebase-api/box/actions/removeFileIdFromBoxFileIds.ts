import { db } from "config/firebase";

import { COLLECTIONS } from "enums";

type RemoveFileIdFromBoxFileIdsProps = {
  userId: string;
  fileId: string;
};
export default async function removeFileIdFromBoxFileIds({
  userId,
  fileId,
}: RemoveFileIdFromBoxFileIdsProps) {
  const boxesSnapshot = await db
    .collection(COLLECTIONS.boxes)
    .where("ownerId", "==", userId)
    .where("fileIds", "array-contains", fileId)
    .get();

  if (!boxesSnapshot.empty) {
    const batch = db.batch();
    boxesSnapshot.forEach((boxDoc) => {
      const updatedFileIds = boxDoc
        .data()
        .fileIds.filter((id: string) => id !== fileId);
      batch.update(boxDoc.ref, { fileIds: updatedFileIds });
    });
    await batch.commit();
  }
}
