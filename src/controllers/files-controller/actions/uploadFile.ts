import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { uploadFileSingle } from "utils/file/uploadFile";

import { fileUploadSchema } from "schemas";

import { ValidationError } from "yup";
import formatYupError from "helpers/yup/formatYupError";

export default async function uploadFile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const encryptedFile = req.file
      ? (req.file as Express.Multer.File)
      : undefined;

    if (!encryptedFile) {
      return res.status(400).send({ message: "File is required" });
    }

    const {
      encryptedIvBase64,
      encryptedAesKeys: encryptedAesKeysField,
      senderPublicKeyHex,
      fileOriginalName,
      fileMimeType,
      boxId,
    } = req.body;

    let encryptedAesKeys;
    try {
      encryptedAesKeys = JSON.parse(encryptedAesKeysField);
    } catch (error) {
      return res.status(400).send({ message: "Invalid Encrypted Aes Keys" });
    }

    const payload = {
      encryptedIvBase64,
      encryptedAesKeys,
      senderPublicKeyHex,
      fileOriginalName,
      fileMimeType,
      boxId,
    };

    await fileUploadSchema.validate(payload);

    const userId = req.userId as string;

    const addedFile = await uploadFileSingle({
      file: encryptedFile,
      originalName: fileOriginalName,
      mimeType: fileMimeType,
      userId,
      isCheckSize: true,
      encryptedIvBase64,
      encryptedAesKeys,
      senderPublicKeyHex,
      boxId,
    });

    res.status(200).send({ file: addedFile });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(formatYupError(error));
    }

    next(error);
  }
}
