import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { encryptFileSync } from "helpers/encryptFileSync";

export default async function encryptFile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const file = req.file ? (req.file as Express.Multer.File) : undefined;
    const signature = req.body.signature;

    if (!file || !signature) {
      return res.status(400).json({ error: "No file or signature provided." });
    }

    const buffer = Buffer.from(file.buffer);

    const encryptedBuffer = await encryptFileSync(buffer, signature);

    res.set({
      "Content-Type": "application/octet-stream",
      "Content-Disposition": "attachment; filename=encrypted_file",
    });

    res.status(200).send(encryptedBuffer);
  } catch (error) {
    next(error);
  }
}
