import { signatureToKeyIV } from "./signatureToKey";
import crypto from "crypto";

export const encryptFileSync = async (fileData: any, signature: string) => {
  const { keyBuffer, ivBuffer } = signatureToKeyIV(signature);

  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, ivBuffer);

  const encryptedData = Buffer.concat([
    cipher.update(fileData),
    cipher.final(),
  ]);

  return encryptedData;
};
