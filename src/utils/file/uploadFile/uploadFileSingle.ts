import { calculateTotalSize } from "firebase-api/user";
import { MAX_USER_STORAGE_SIZE } from "const";

import generateMockTransactionHash from "helpers/generateMockTransactionHash";
import { addFilesToBox } from "./helpers";

import { ESCROW_FILE_STATUSES } from "enums";

import { Base64String } from "custom-types/helpers";
import { File } from "custom-types/File";

import { uploadFileToStorage } from "storage/pinata";

type UploadSingleParams = {
  file: Express.Multer.File;
  originalName: string;
  mimeType: string;
  userId: string;
  isCheckSize: boolean;
  encryptedIvBase64: Base64String;
  encryptedAesKeys: Record<string, Base64String>;
  senderPublicKeyHex: string;
  boxId?: string;
  escrowFileStatus?: ESCROW_FILE_STATUSES;
  fileContractId?: string;
};

export default async function uploadFileSingle({
  file,
  originalName,
  mimeType,
  userId,
  isCheckSize = true,
  encryptedIvBase64,
  encryptedAesKeys,
  senderPublicKeyHex,
  boxId,
  escrowFileStatus,
  fileContractId,
}: UploadSingleParams) {
  let expectedTotalSize = isCheckSize ? await calculateTotalSize(userId) : 0;

  if (!originalName || !mimeType) {
    throw new Error("File's originalName and mimeType are required");
  }

  if (isCheckSize) {
    expectedTotalSize += file.size;
  }

  if (isCheckSize && expectedTotalSize > MAX_USER_STORAGE_SIZE) {
    throw new Error("Total size of files can't exceed 100 MB");
  }

  const uploadedStorageFile = await uploadFileToStorage(
    file.buffer,
    originalName,
    mimeType
  );

  const fileFormatted = {
    name: originalName,
    size: uploadedStorageFile.PinSize,
    mimetype: mimeType,
    createdAt: uploadedStorageFile.Timestamp,
    fileTransactionHash: generateMockTransactionHash(),
    ownerIds: [userId],
    ipfsHash: uploadedStorageFile.IpfsHash,
    encryptedIvBase64,
    encryptedAesKeys,
    senderPublicKeyHex,
  } as File;

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
