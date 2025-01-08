import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { getBoxesByUserIdAndType } from "firebase-api/box";

import { uploadFileSingle } from "utils/file/uploadFile";

import { BOX_TYPES, ESCROW_FILE_STATUSES } from "enums";

export default async function uploadEscrowFile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const fileOriginalName = req.body.files[0].originalName;
    const fileMimeType = req.body.files[0].mimeType;
    const fileContractId = req.body.files[0].fileContractId;

    if (!fileOriginalName || !fileMimeType || !fileContractId) {
      return res.status(400).json({
        error:
          "fileOriginalName, fileMimeType, fileContractId are required fields",
      });
    }

    const files = req.files as Express.Multer.File[];
    const file = files[0];

    if (!file) {
      return res.status(400).json({ error: "No file provided." });
    }

    const userId = req.userId as string;

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
      escrowFileStatus: ESCROW_FILE_STATUSES.created,
      fileContractId,
    });

    const addedFileDTO = {
      id: addedFile.id,
      name: addedFile.name,
      fileContractId: addedFile.fileContractId,
    };

    return res.status(200).send({ files: [addedFileDTO] });
  } catch (error) {
    next(error);
  }
}
