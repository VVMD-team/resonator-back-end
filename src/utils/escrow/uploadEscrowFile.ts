import { getBoxesByUserIdAndType } from "firebase-api/box";
import { uploadFileSingle } from "utils/file/uploadFile";

import { BOX_TYPES, ESCROW_FILE_STATUSES } from "enums";

type UploadEscrowFileData = {
  userId: string;
  file: Express.Multer.File;
  fileMimeType: string;
  fileOriginalName: string;
  fileContractId: string;
  sharedKey: string;
  fileStatus: ESCROW_FILE_STATUSES;
};

export default async function uploadEscrowFile({
  userId,
  file,
  fileMimeType,
  fileOriginalName,
  fileContractId,
  sharedKey,
  fileStatus,
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
    fileRequestData: {
      mimetype: fileMimeType,
      originalName: fileOriginalName,
    },
    userId,
    isCheckSize: false,
    boxId: filesForSellBoxId,
    escrowFileStatus: fileStatus,
    fileContractId,
    sharedKey,
  });

  return addedFile;
}
