

export const signatureToKeyIV = (signature: string) => {
  const hexSignature = signature.slice(2);

  const key = hexSignature.slice(0, 64);
  const iv = hexSignature.slice(64, 96);
  const keyBuffer = Buffer.from(key, "hex");
  const ivBuffer = Buffer.from(iv, "hex");

  return { keyBuffer, ivBuffer };
};