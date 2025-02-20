import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { updateBoxSize, getBoxesWithFile } from "firebase-api/box";
import { removeFileOwnerById } from "firebase-api/file";

import { removeFileOwnerSchema } from "schemas";

import { ValidationError } from "yup";
import formatYupError from "helpers/yup/formatYupError";

export default async function removeFileOwner(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { fileId } = req.body;

    const payload = { fileId };
    await removeFileOwnerSchema.validate(payload);

    const userId = req.userId as string;

    const boxesWithCurrentFile = await getBoxesWithFile(fileId, userId);

    await removeFileOwnerById({ userId, fileId });

    for (const boxId of boxesWithCurrentFile) {
      await updateBoxSize(boxId);
    }

    res.status(200).send({ result: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(formatYupError(error));
    }

    next(error);
  }
}
