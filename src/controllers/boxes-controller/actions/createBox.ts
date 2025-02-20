import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { setBoxToUser } from "firebase-api/user";
import { createBox as createBoxInDB } from "firebase-api/box";

export default async function createBox(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { boxName } = req.body;

    if (!boxName) {
      return res.status(400).send({ message: "Box name is required" });
    }

    const userId = req.userId as string;

    const data = await createBoxInDB(boxName, userId);
    await setBoxToUser(data?.id, userId);

    return res.status(200).send({ data });
  } catch (error) {
    next(error);
  }
}
