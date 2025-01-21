import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";
import { getLastUploaded as getLastUploadedFromDB } from "firebase-api/file";

import { mapFileToDTO } from "utils/file/mappers";
import filterFilesFromEscrowFiles from "utils/file/filterFilesFromEscrowFiles";

export default async function getLastUploaded(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId as string;

    const files = await getLastUploadedFromDB(userId);

    const filesDTOShort = files
      .filter(filterFilesFromEscrowFiles)
      .map((file) => mapFileToDTO(file, "short"));

    res.status(200).send({ files: filesDTOShort });
  } catch (error) {
    next(error);
  }
}
