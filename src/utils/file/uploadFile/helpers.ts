import { uploadFileToStorage } from "firebase-storage/file";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import generateMockTransactionHash from "helpers/generateMockTransactionHash";

import { updateBoxSize, getBoxesByUserIdAndType } from "firebase-api/box";
import { setFileIdToBox, setFiles } from "firebase-api/file";

import { BOX_TYPES } from "enums";
import { File } from "custom-types/File";

type UploadFileToStorageAndFormatData = {
  file: Express.Multer.File;
  originalName: string;
  mimeType: string;
  userId: string;
};

export const uploadFileToStorageAndFormat = async ({
  file,
  originalName,
  mimeType,
  userId,
}: UploadFileToStorageAndFormatData): Promise<File> => {
  const { filePath, publicUrl } = await uploadFileToStorage(
    file.buffer,
    originalName,
    mimeType
  );

  return {
    ownerIds: [userId],
    name: originalName,
    size: file.size,
    mimetype: mimeType,
    createdAt: FieldValue.serverTimestamp() as Timestamp,
    filePath,
    publicUrl,
    fileTransactionHash: generateMockTransactionHash(),
  };
};

export const addFilesToBox = async (
  userId: string,
  filesFormatted: File[],
  boxId?: string
) => {
  const addedFiles = await setFiles(filesFormatted);

  const fileIds = addedFiles.map(({ id }) => id);

  if (boxId) {
    await setFileIdToBox(boxId, fileIds);
    await updateBoxSize(boxId);
  } else {
    const defaultBoxes = await getBoxesByUserIdAndType(
      userId,
      BOX_TYPES.default
    );

    if (defaultBoxes.length === 0) {
      console.error(`User do not have default box. userId: ${userId}`);
      throw new Error("User do not have default box.");
    }

    if (defaultBoxes.length > 1) {
      console.error(`User has more than one default box. userId: ${userId}`);

      throw new Error("User has more than one default box.");
    }

    const { id: defaultBoxId } = defaultBoxes[0];

    await setFileIdToBox(defaultBoxId, fileIds);
    await updateBoxSize(defaultBoxId);
  }

  return addedFiles;
};
