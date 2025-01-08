import { calculateTotalSize } from "firebase-api/user";
import { MAX_USER_STORAGE_SIZE } from "const";

import { uploadFileToStorageAndFormat, addFilesToBox } from "./helpers";

import { ESCROW_FILE_STATUSES } from "enums";

type UploadSingleParams = {
  file: Express.Multer.File;
  fileRequestData: any;
  userId: string;
  isCheckSize: boolean;
  boxId?: string;
  escrowFileStatus?: ESCROW_FILE_STATUSES;
  fileContractId?: string;
};

export default async function uploadFileSingle({
  file,
  fileRequestData,
  userId,
  isCheckSize = true,
  boxId,
  escrowFileStatus,
  fileContractId,
}: UploadSingleParams) {
  let expectedTotalSize = isCheckSize ? await calculateTotalSize(userId) : 0;

  const originalName = fileRequestData.originalName;
  const mimeType = fileRequestData.mimetype;

  if (!originalName || !mimeType) {
    throw new Error("File's originalName and mimeType are required");
  }

  if (isCheckSize) {
    expectedTotalSize += file.size;
  }

  if (isCheckSize && expectedTotalSize > MAX_USER_STORAGE_SIZE) {
    throw new Error("Total size of files can't exceed 100 MB");
  }

  const fileFormatted = await uploadFileToStorageAndFormat({
    file,
    originalName,
    mimeType,
    userId,
  });

  if (escrowFileStatus) {
    fileFormatted.escrowFileStatus = escrowFileStatus;
  }
  if (fileContractId) {
    fileFormatted.fileContractId = fileContractId;
  }

  const addedFiles = await addFilesToBox(userId, [fileFormatted], boxId);
  const addedFile = addedFiles[0];

  return addedFile;
}
