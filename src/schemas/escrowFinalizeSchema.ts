import { object, string } from "yup";
import { ESCROW_DEALS } from "enums";

import enumsValidator from "helpers/yup/enumsValidator";
import { base64Regex, base64RecordTestCallback } from "./global";

const checkIsRequiredDealType_to_file = (
  [dealType]: Array<any>,
  schema: any
) => {
  return [ESCROW_DEALS.funds_to_file, ESCROW_DEALS.file_to_file].includes(
    dealType
  )
    ? schema.required()
    : schema.notRequired();
};

const escrowFinalizeSchema = object().shape({
  escrowId: string().required().label("Escrow Id"),
  dealType: enumsValidator(ESCROW_DEALS).required().label("Deal type"),
  orderContractId: string().required().label("Order Contract Id"),

  fileEncryptedIvBase64: string()
    .when("dealType", checkIsRequiredDealType_to_file)
    .matches(base64Regex, "Invalid Base64 string")
    .label("Encrypted IV"),
  fileEncryptedAesKeys: object()
    .when("dealType", {
      is: (dealType: ESCROW_DEALS) =>
        [ESCROW_DEALS.funds_to_file, ESCROW_DEALS.file_to_file].includes(
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
    .when("dealType", checkIsRequiredDealType_to_file)
    .label("Sender Public Key"),

  fileOriginalName: string()
    .when("dealType", checkIsRequiredDealType_to_file)
    .label("File Original Name"),
  fileMimeType: string()
    .when("dealType", checkIsRequiredDealType_to_file)
    .label("File mime Type"),
  fileContractId: string()
    .when("dealType", checkIsRequiredDealType_to_file)
    .label("Contract File Id"),
});

export default escrowFinalizeSchema;
