import { storage } from "config/firebase";

export const deleteFileFromStorage = async (filePath: string) => {
  try {
    const bucket = storage.bucket();
    const file = bucket.file(filePath);
    await file.delete();
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error("File deletion failed");
  }
};
