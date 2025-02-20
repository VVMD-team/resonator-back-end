import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { getFileById } from "firebase-api/file";

import { decryptFileSync } from "helpers/decryptFileSync";
import { fetchFileFromPublicUrl } from "helpers/fetchFileFromPublicUrl";

export default async function decryptFile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { fileId, signature, mimetype } = req.body;

    if (!fileId || !signature || !mimetype) {
      return res.status(400).json({
        error: "fileId, signature, and mimetype are required fields",
      });
    }

    const userId = req.userId as string;

    const file = await getFileById(fileId);

    if (!file || !file.ownerIds.includes(userId)) {
      throw new Error(`File with fileId: ${fileId} not found`);
    }

    if (!file.publicUrl) {
      throw new Error(`publicUrl is reqired!`);
    }

    const encryptedArrayBuffer = await fetchFileFromPublicUrl(file.publicUrl);

    if (!encryptedArrayBuffer) {
      throw new Error(`File with id: ${fileId} not received`);
    }

    const encryptedBuffer = Buffer.from(encryptedArrayBuffer);

    const decryptedBuffer = await decryptFileSync(encryptedBuffer, signature);

    res.set({
      "Content-Type": mimetype,
      "Content-Disposition": "attachment; filename=decrypted_file",
    });

    res.status(200).send(decryptedBuffer);
  } catch (error) {
    next(error);
  }
}
