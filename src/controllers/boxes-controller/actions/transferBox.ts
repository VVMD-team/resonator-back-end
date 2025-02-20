import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { checkIsUsersBox, transferBoxToAnotherUser } from "firebase-api/box";

import { shareTransferBoxSchema } from "schemas";

import { ValidationError } from "yup";
import formatYupError from "helpers/yup/formatYupError";

export default async function transferBox(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files.length) {
      return res
        .status(400)
        .send({ result: false, message: "Files are required" });
    }

    const { recipientWalletPublicKey, boxId } = req.body;

    const filesData = files.map((file, index) => {
      const id = req.body.files[index].id;
      const encryptedIvBase64 = req.body.files[index].encryptedIvBase64;
      const encryptedAesKeys = JSON.parse(
        req.body.files[index].encryptedAesKeys
      );
      const senderPublicKeyHex = req.body.files[index].senderPublicKeyHex;

      return {
        id,
        encryptedIvBase64,
        encryptedAesKeys,
        senderPublicKeyHex,
        fileBuffer: file.buffer,
      };
    });

    const payload = {
      recipientWalletPublicKey,
      boxId,
      filesData,
    };
    await shareTransferBoxSchema.validate(payload);

    const userId = req.userId as string;

    const isUsersBox = await checkIsUsersBox(boxId, userId);

    if (!isUsersBox) {
      return res
        .status(500)
        .send({ result: false, message: "Something went wrong..." });
    }

    const recipientWalletPublicKeyInLowerCase = recipientWalletPublicKey
      .trim()
      .toLowerCase();

    await transferBoxToAnotherUser({
      userId,
      recipientWalletPublicKey: recipientWalletPublicKeyInLowerCase,
      boxId,
      filesData,
    });

    return res.status(200).send({ result: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(formatYupError(error));
    }

    next(error);
  }
}
