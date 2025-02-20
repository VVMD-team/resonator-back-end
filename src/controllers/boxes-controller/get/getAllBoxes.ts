import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { getBoxesByUserId } from "firebase-api/box";

export default async function getAllBoxes(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId as string;

    const boxes = await getBoxesByUserId(userId);

    return res.status(200).send({ data: boxes, total: boxes.length });
  } catch (error) {
    next(error);
  }
}
