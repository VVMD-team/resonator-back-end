import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";
import { getFileById } from "firebase-api/file";

import { mapFileToDTO } from "utils/file/mappers";

export default async function getFile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.query as { id?: string };

    if (!id) {
      return res
        .status(400)
        .send({ file: null, message: "File ID is required" });
    }

    const userId = req.userId as string;

    const file = await getFileById(id);

    if (!file || !file.ownerIds.includes(userId)) {
      res
        .status(404)
        .send({ file: null, message: `File with id: ${id} not found` });
    }

    const fileDTO = mapFileToDTO(file);

    res.status(200).send({ file: fileDTO });
  } catch (error) {
    next(error);
  }
}
