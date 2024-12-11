import { calculateTotalSize } from "firebase-api/user";
import { File } from "custom-types/File";
import { MAX_USER_STORAGE_SIZE } from "../../../constants";

import { uploadFileToStorageAndFormat, addFilesToBox } from "./helpers";

type UploadSingleParams = {
  file: Express.Multer.File;
  fileRequestData: any;
  userId: string;
  isCheckSize: boolean;
  boxId?: string;
};

export default async function uploadFileSingle({
  file,
  fileRequestData,
  userId,
  isCheckSize = true,
  boxId,
}: UploadSingleParams) {
  let expectedTotalSize = isCheckSize ? await calculateTotalSize(userId) : 0;

  const originalName = fileRequestData.originalName;
  const mimeType = fileRequestData.mimeType;

  if (!originalName || !mimeType) {
    throw new Error("File's originalName and mimeType are required");
  }

  if (isCheckSize) {
    expectedTotalSize += file.size;
  }

  if (isCheckSize && expectedTotalSize > MAX_USER_STORAGE_SIZE) {
    throw new Error("Total size of files can't exceed 100 MB");
  }

  const fileFormatted: File = await uploadFileToStorageAndFormat(
    file,
    originalName,
    mimeType,
    userId
  );

  const addedFiles = await addFilesToBox(userId, [fileFormatted], boxId);
  const addedFile = addedFiles[0];

  return addedFile;
}
