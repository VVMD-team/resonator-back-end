import { storage } from "../config/firebase";
import { v4 as uuidv4 } from "uuid";

export const uploadFileToStorage = async (
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string,
  filePathParam?: string
) => {
  try {
    const bucket = storage.bucket();

    const filePath = filePathParam
      ? filePathParam
      : `uploads/${uuidv4()}-${originalName}`;

    const file = bucket.file(filePath);

    await file.save(fileBuffer, {
      metadata: {
        contentType: mimeType,
      },
    });

    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${
      bucket.name
    }/o/${encodeURIComponent(filePath)}?alt=media`;

    return { filePath, publicUrl };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("File upload failed");
  }
};

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
