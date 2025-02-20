import { COLLECTIONS } from "enums";
import { db } from "config/firebase";
import { File } from "custom-types/File";

export default async function setFiles(files: File[]) {
  const collectionRef = db.collection(COLLECTIONS.files);
  try {
    const addedFiles = await Promise.all(
      files.map(async (file: File) => {
        const docRef = await collectionRef.add(file);
        return { ...file, id: docRef.id };
      })
    );

    return addedFiles;
  } catch (error) {
    throw new Error(`Something went wrong with adding file. Error: ${error}`);
  }
}
