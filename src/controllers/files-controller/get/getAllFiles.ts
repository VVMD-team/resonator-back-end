import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";
import { getFiles } from "firebase-api/file";

import { mapFileToDTO } from "utils/file/mappers";
import filterFilesFromEscrowFiles from "utils/file/filterFilesFromEscrowFiles";

export default async function getAllFiles(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId as string;
    const files = await getFiles(userId);

    const filesDTOShort = files
      .filter(filterFilesFromEscrowFiles)
      .map((file) => mapFileToDTO(file, "short"));

    res.status(200).send({ files: filesDTOShort });
  } catch (error) {
    next(error);
  }
}
