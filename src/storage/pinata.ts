import { pinata } from "config/pinata";

export const uploadFileToStorage = async (
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string
) => {
  try {
    const file = new File([fileBuffer], originalName, { type: mimeType });

    const upload = await pinata.upload.file(file, {
      groupId: process.env.PINATA_GROUP_ID as string,
    });

    return upload;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("File upload failed");
  }
};

export const deleteFilesFromStorage = async (filesCids: string[]) => {
  try {
    const unpin = await pinata.unpin(filesCids);

    return unpin;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error("File deletion failed");
  }
};

type ReplaceFileInStorageProps = {
  fileBuffer: Buffer;
  originalName: string;
  mimeType: string;
  fileCid: string;
};
export const replaceFileInStorage = async ({
  fileBuffer,
  originalName,
  mimeType,
  fileCid,
}: ReplaceFileInStorageProps) => {
  const upload = await uploadFileToStorage(fileBuffer, originalName, mimeType);

  await deleteFilesFromStorage([fileCid]);

  return upload;
};

export const getFileFromStorage = async (fileCid: string) => {
  const data = await pinata.gateways.get(fileCid);

  return data;
};
