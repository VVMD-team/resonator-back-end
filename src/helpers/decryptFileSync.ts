import { signatureToKeyIV } from "./signatureToKey";
import crypto from "crypto";

export const decryptFileSync = async (fileData: any, signature: string) => {
  const { keyBuffer, ivBuffer } = signatureToKeyIV(signature);

  const decipher = crypto.createDecipheriv("aes-256-cbc", keyBuffer, ivBuffer);

  const decryptedData = Buffer.concat([
    decipher.update(fileData),
    decipher.final(),
  ]);

  return decryptedData;
};
