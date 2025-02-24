import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { addCustomKeyPair as addCustomKeyPairDB } from "firebase-api/user";

import { ValidationError } from "yup";
import formatYupError from "helpers/yup/formatYupError";

import { customKeyPairSchema } from "schemas";

export default async function addCustomKeyPair(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const userId = req.userId as string;

  try {
    const {
      customPubKey,
      customPrivKey, // has to be encrypted on frontend
    } = req.body;

    const payload = { customPubKey, customPrivKey };

    await customKeyPairSchema.validate(payload);

    await addCustomKeyPairDB({
      userId,
      customPubKey,
      customPrivKey,
    });

    return res.status(200).send({ result: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(formatYupError(error));
    }

    next(error);
  }
}
