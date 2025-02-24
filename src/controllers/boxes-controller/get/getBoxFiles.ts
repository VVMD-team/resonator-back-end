import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { getFilesByBoxId } from "firebase-api/box";

export default async function getBoxFiles(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id, is_long } = req.query as { id?: string; is_long?: string };

    if (!id) {
      return res.status(400).send({ message: "Box ID is required" });
    }

    const userId = req.userId as string;

    const files = await getFilesByBoxId(id, userId, is_long === "true");

    res.status(200).send({ files });
  } catch (error) {
    next(error);
  }
}
