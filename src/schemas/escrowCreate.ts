import { object, string, mixed } from "yup";
import { ESCROW_DEALS, currencyValues } from "enums";

import enumsValidator from "helpers/yup/enumsValidator";
import { base64Regex, base64RecordTestCallback } from "./global";

const maxDecimals = 3;
const maxIntegers = 6;

const paymentSchema = {
  amount: string()
    .required()
    .test("is-valid-number", "Must be a valid number", (value) => {
      if (value === undefined || value === null) return true;
      return !isNaN(Number(value));
    })
    .test(
      "max-decimals",
      `Decimal part must have up to ${maxDecimals} digits`,
      (value) => {
        if (!value) return true;
        const decimalPart = value.split(".")[1];
        return !decimalPart || decimalPart.length <= maxDecimals;
      }
    )
    .test(
      "max-integer",
      `Integer part must have no more than ${maxIntegers} digits`,
      (value) => {
        if (!value) return true;
        const integerPart = value.split(".")[0].replace("-", "");
        return integerPart.length <= maxIntegers;
      }
    )
    .label("Amount"),
  currency: mixed()
    .oneOf(currencyValues, "Invalid currency")
    .required()
    .label("Currency"),
};

// const validExtensions = ["txt", "jpg", "png", "pdf", "docx", "xlsx"];

const checkIsRequiredDealType_file_to = (
  [dealType]: Array<any>,
  schema: any
) => {
  return [ESCROW_DEALS.file_to_funds, ESCROW_DEALS.file_to_file].includes(
    dealType
  )
    ? schema.required()
    : schema.notRequired();
};

const escrowCreateSchema = object().shape({
  contractOrderHash: string().required().label("Contract Order Hash"),
  name: string().required().max(50).label("Name"),
  description: string().required().max(500).label("Description"),
  counterpartyAddress: string().required().label("Counterparty Address"),
  dealType: enumsValidator(ESCROW_DEALS).required().label("Deal type"),

  fileEncryptedIvBase64: string()
    .when("dealType", checkIsRequiredDealType_file_to)
    .matches(base64Regex, "Invalid Base64 string")
    .label("Encrypted IV"),
  fileEncryptedAesKeys: object()
    .when("dealType", {
      is: (dealType: ESCROW_DEALS) =>
        [ESCROW_DEALS.file_to_funds, ESCROW_DEALS.file_to_file].includes(
          dealType
        ),
      then: (schema) =>
        schema
          .required("Encrypted Aes Keys are required")
          .test(
            "is-base64-record",
            "All values must be valid Base64 strings",
            base64RecordTestCallback
          )
          .test(
            "is-not-empty",
            "Encrypted Aes Keys cannot be empty",
            (value) => Object.keys(value || {}).length > 0
          ),
      otherwise: (schema) => schema.notRequired(),
    })
    .label("Encrypted Aes Keys"),
  fileSenderPublicKeyHex: string()
    .when("dealType", checkIsRequiredDealType_file_to)
    .label("Sender Public Key"),
  fileOriginalName: string()
    .when("dealType", checkIsRequiredDealType_file_to)
    .label("File Original Name"),
  fileMimeType: string()
    .when("dealType", checkIsRequiredDealType_file_to)
    .label("File mime Type"),
  fileContractId: string()
    .when("dealType", checkIsRequiredDealType_file_to)
    .label("Contract File Id"),

  // counterpartyFileName: string()
  //   .when("dealType", ([dealType], schema) => {
  //     return [ESCROW_DEALS.funds_to_file, ESCROW_DEALS.file_to_file].includes(
  //       dealType
  //     )
  //       ? schema.required()
  //       : schema.notRequired();
  //   })
  //   .matches(
  //     /^[^<>:"/\\|?*\x00-\x1F]+$/,
  //     "Invalid filename: contains restricted characters"
  //   )
  //   .test("has-valid-extension", "Invalid file extension", (value) => {
  //     if (!value) return false;
  //     const extension = value.split(".").pop();
  //     if (!extension) return false;
  //     return validExtensions.includes(extension);
  //   })
  //   .max(255, "Filename too long")
  //   .label("Counterparty File Name"),

  counterpartyFileContractId: string()
    .when("dealType", ([dealType], schema) => {
      return [ESCROW_DEALS.funds_to_file, ESCROW_DEALS.file_to_file].includes(
        dealType
      )
        ? schema.required()
        : schema.notRequired();
    })
    .label("Contract Counterparty File Id"),

  requestedPayment: object()
    .when("dealType", ([dealType], schema) => {
      return [ESCROW_DEALS.file_to_funds, ESCROW_DEALS.funds_to_funds].includes(
        dealType
      )
        ? schema.required().shape(paymentSchema)
        : schema.notRequired();
    })
    .label("Counterparty Payment"),

  providedPayment: object()
    .when("dealType", ([dealType], schema) => {
      return [ESCROW_DEALS.funds_to_file, ESCROW_DEALS.funds_to_funds].includes(
        dealType
      )
        ? schema.required().shape(paymentSchema)
        : schema.notRequired();
    })
    .label("Provided Payment"),
});

export default escrowCreateSchema;
