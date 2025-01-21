import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";
import { deleteFileById } from "firebase-api/file";

import { updateBoxSize, getBoxesWithFile } from "firebase-api/box";

export default async function deleteFile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { fileId } = req.body;

    if (!fileId) {
      return res
        .status(400)
        .send({ result: false, message: "File ID is required" });
    }

    const userId = req.userId as string;

    const boxesWithCurrentFile = await getBoxesWithFile(fileId);

    await deleteFileById(fileId, userId);

    for (const boxId of boxesWithCurrentFile) {
      await updateBoxSize(boxId);
    }

    res.status(200).send({ result: true });
  } catch (error) {
    next(error);
  }
}
