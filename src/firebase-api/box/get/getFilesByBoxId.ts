import { db } from "config/firebase";

import { COLLECTIONS } from "enums";

import { Box } from "custom-types/Box";
import { File } from "custom-types/File";

export default async function getFilesByBoxId(
  boxId: string,
  userId: string,
  isLong: boolean = false
) {
  const boxDoc = await db.collection(COLLECTIONS.boxes).doc(boxId).get();

  if (!boxDoc.exists) {
    throw new Error(`Box with ID ${boxId} does not exist.`);
  }

  const { fileIds, ownerId } = boxDoc.data() as Box;

  if (ownerId !== userId || !fileIds || fileIds.length === 0) {
    return [];
  }

  const filePromises = fileIds.map(
    async (fileId) => await db.collection(COLLECTIONS.files).doc(fileId).get()
  );
  const fileDocs = await Promise.all(filePromises);

  const files = fileDocs
    .filter((doc) => doc.exists)
    .map((doc) => {
      const fileData = doc.data() as File;
      return { id: doc.id, ...fileData };
    });

  if (isLong) {
    return files;
  }

  const filesShort = files.map(({ id, name, mimetype, size }) => ({
    id,
    name,
    mimetype,
    size,
  }));

  return filesShort;
}
