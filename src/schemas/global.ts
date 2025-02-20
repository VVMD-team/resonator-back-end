import { mixed } from "yup";

export const base64Regex =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

export const base64RecordTestCallback = (obj: any) => {
  if (typeof obj !== "object" || obj === null) return false;

  return Object.values(obj).every(
    (value) => typeof value === "string" && base64Regex.test(value)
  );
};

export const bufferSchema = mixed().test(
  "is-buffer",
  "Must be a valid Buffer",
  (value) => Buffer.isBuffer(value)
);
