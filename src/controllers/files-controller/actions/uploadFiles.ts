import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { uploadFileMultiple } from "utils/file/uploadFile";

export default async function uploadFiles(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const files = req.files as Express.Multer.File[];
    const userId = req.userId as string;

    const addedFiles = await uploadFileMultiple({
      files,
      filesRequestData: req.body.files,
      userId,
      isCheckSize: true,
      boxId: req.body.boxId,
    });

    res.status(200).send({ files: addedFiles });
  } catch (error) {
    next(error);
  }
}
