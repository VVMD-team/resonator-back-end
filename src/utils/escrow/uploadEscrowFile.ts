import { getBoxesByUserIdAndType } from "firebase-api/box";
import { uploadFileSingle } from "utils/file/uploadFile";

import { BOX_TYPES, ESCROW_FILE_STATUSES } from "enums";
import { Base64String } from "custom-types/helpers";

type UploadEscrowFileData = {
  userId: string;
  file: Express.Multer.File;
  fileMimeType: string;
  fileOriginalName: string;
  fileContractId: string;
  fileStatus: ESCROW_FILE_STATUSES;

  encryptedIvBase64: Base64String;
  encryptedAesKeys: Record<string, Base64String>;
  senderPublicKeyHex: string;
};

export default async function uploadEscrowFile({
  userId,
  file,
  fileMimeType,
  fileOriginalName,
  fileContractId,
  fileStatus,

  encryptedIvBase64,
  encryptedAesKeys,
  senderPublicKeyHex,
}: UploadEscrowFileData) {
  const filesForSellBoxes = await getBoxesByUserIdAndType(
    userId,
    BOX_TYPES.files_for_sell
  );

  if (filesForSellBoxes.length === 0) {
    console.error(`User do not have files_for_sell box. userId: ${userId}`);
    throw new Error("User do not have files_for_sell box.");
  }
  if (filesForSellBoxes.length > 1) {
    console.error(
      `User has more than one files_for_sell box. userId: ${userId}`
    );

    throw new Error("User has more than one files_for_sell box.");
  }

  const { id: filesForSellBoxId } = filesForSellBoxes[0];

  const addedFile = await uploadFileSingle({
    file,
    originalName: fileOriginalName,
    mimeType: fileMimeType,
    userId,
    isCheckSize: false,
    encryptedIvBase64,
    encryptedAesKeys,
    senderPublicKeyHex,
    boxId: filesForSellBoxId,
    escrowFileStatus: fileStatus,
    fileContractId,
  });

  return addedFile;
}
