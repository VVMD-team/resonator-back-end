import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { getFileFromStorage } from "storage/pinata";
import { getFileById } from "firebase-api/file";

export default async function getFileEncryptedData(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.query as { id?: string };

    if (!id) {
      return res
        .status(400)
        .send({ file: null, message: "File ID is required" });
    }

    const file = await getFileById(id);

    if (!file) {
      return res.status(404).send({ message: "File not found" });
    }

    const fileData = await getFileFromStorage(file.ipfsHash);

    if (!fileData || !fileData.data) {
      return res.status(404).json({ error: "File not found" });
    }

    let buffer: Buffer;

    if (Buffer.isBuffer(fileData.data)) {
      buffer = fileData.data; // Already a buffer
    } else if (typeof fileData.data === "string") {
      buffer = Buffer.from(fileData.data, "utf-8"); // Convert string to buffer
    } else if (fileData.data instanceof Blob) {
      buffer = Buffer.from(await fileData.data.arrayBuffer()); // Convert Blob to Buffer
    } else if (typeof fileData.data === "object") {
      buffer = Buffer.from(JSON.stringify(fileData.data), "utf-8"); // Convert JSON to buffer
    } else {
      return res.status(400).json({ error: "Invalid file data type" });
    }

    if (fileData.contentType) {
      res.setHeader("Content-Type", fileData.contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${file.name}"`
      );
      res.setHeader("Content-Length", buffer.length.toString());
    }

    res.status(200).end(buffer);
  } catch (error) {
    next(error);
  }
}
