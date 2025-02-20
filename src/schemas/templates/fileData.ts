import { object, string } from "yup";
import { base64Regex, base64RecordTestCallback } from "../global";

const fileData = {
  encryptedIvBase64: string()
    .matches(base64Regex, "Invalid Base64 string")
    .required()
    .label("Encrypted IV"),
  encryptedAesKeys: object()
    .required()
    .test(
      "is-base64-record",
      "All values must be valid Base64 strings",
      base64RecordTestCallback
    )
    .test(
      "is-not-empty",
      "Encrypted Aes Keys cannot be empty",
      (value) => Object.keys(value || {}).length > 0
    )
    .label("Encrypted Aes Keys"),
  senderPublicKeyHex: string().required().label("Sender Public Key"),
};

export default fileData;
