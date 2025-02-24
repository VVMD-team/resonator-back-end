import { updateBoxSize, getBoxesByUserIdAndType } from "firebase-api/box";
import { setFileIdToBox, setFiles } from "firebase-api/file";

import { BOX_TYPES } from "enums";

import { File } from "custom-types/File";

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
