import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";
import { transferFileToAnotherUser, checkIsUsersFile } from "firebase-api/file";
import { shareTransferFileSchema } from "schemas";

import { ValidationError } from "yup";
import formatYupError from "helpers/yup/formatYupError";

export default async function transferFile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const recryptedFile = req.file
      ? (req.file as Express.Multer.File)
      : undefined;

    if (!recryptedFile) {
      return res.status(400).send({ message: "File is required" });
    }

    const {
      recipientWalletPublicKey,
      fileId,
      encryptedIvBase64,
      encryptedAesKeys: encryptedAesKeysField,
      senderPublicKeyHex,
    } = req.body;

    let encryptedAesKeys;
    try {
      encryptedAesKeys = JSON.parse(encryptedAesKeysField);
    } catch (error) {
      return res.status(400).send({ message: "Invalid Encrypted Aes Keys" });
    }

    const payload = {
      recipientWalletPublicKey,
      fileId,
      encryptedIvBase64,
      encryptedAesKeys,
      senderPublicKeyHex,
    };
    await shareTransferFileSchema.validate(payload);

    const userId = req.userId as string;

    const isUsersFile = await checkIsUsersFile(fileId, userId);

    if (!isUsersFile) {
      res
        .status(500)
        .send({ result: false, message: "Something went wrong..." });
    }

    const recipientWalletPublicKeyInLowerCase = recipientWalletPublicKey
      .trim()
      .toLowerCase();

    await transferFileToAnotherUser({
      senderUserId: userId,
      recipientWalletPublicKey: recipientWalletPublicKeyInLowerCase,
      fileId,
      fileBuffer: recryptedFile.buffer,
      encryptedIvBase64,
      encryptedAesKeys,
      senderPublicKeyHex,
    });

    return res.status(200).send({ result: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(formatYupError(error));
    }

    next(error);
  }
}
