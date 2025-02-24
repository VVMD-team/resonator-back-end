import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { deleteBoxIdFromUser } from "firebase-api/user";
import { deleteBoxById, checkBoxType } from "firebase-api/box";
import { BOX_TYPES } from "enums";

export default async function deleteBox(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { boxId } = req.body;

    if (!boxId) {
      return res
        .status(400)
        .send({ result: false, message: "Box ID is required" });
    }

    const userId = req.userId as string;

    const boxType = await checkBoxType(boxId);

    if (boxType !== BOX_TYPES.custom) {
      return res
        .status(400)
        .send({ result: false, message: "You can't delete this box" });
    }

    const resultDeleteBoxById = await deleteBoxById(boxId, userId);

    const resultDeleteBoxIdFromUser = await deleteBoxIdFromUser(boxId, userId);

    const result = resultDeleteBoxById && resultDeleteBoxIdFromUser;

    if (!result) {
      return res
        .status(500)
        .send({ result: false, message: "Something went wrong..." });
    }

    return res.status(200).send({ result });
  } catch (error) {
    next(error);
  }
}
