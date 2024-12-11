import { calculateTotalSize } from "firebase-api/user";
import { File } from "custom-types/File";
import { MAX_USER_STORAGE_SIZE } from "../../../constants";

import { uploadFileToStorageAndFormat, addFilesToBox } from "./helpers";

type UploadMultipleParams = {
  files: Express.Multer.File[];
  filesRequestData: any;
  userId: string;
  isCheckSize: boolean;
  boxId?: string;
};

export default async function uploadFileMultiple({
  files,
  filesRequestData,
  userId,
  isCheckSize = true,
  boxId,
}: UploadMultipleParams) {
  let expectedTotalSize = isCheckSize ? await calculateTotalSize(userId) : 0;

  const filesFormattedPromises: Promise<File>[] = files.map(
    async (file, index) => {
      const originalName = filesRequestData[index].originalName;
      const mimeType = filesRequestData[index].mimeType;

      if (!originalName || !mimeType) {
        throw new Error("File's originalName and mimeType are required");
      }

      if (isCheckSize) {
        expectedTotalSize += file.size;
      }

      const fileFormatted = await uploadFileToStorageAndFormat(
        file,
        originalName,
        mimeType,
        userId
      );

      return fileFormatted;
    }
  );

  if (isCheckSize && expectedTotalSize > MAX_USER_STORAGE_SIZE) {
    throw new Error("Total size of files can't exceed 100 MB");
  }

  const filesFormatted: File[] = await Promise.all(filesFormattedPromises);

  const addedFiles = await addFilesToBox(userId, filesFormatted, boxId);

  return addedFiles;
}
