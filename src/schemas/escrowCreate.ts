import { object, string, mixed } from "yup";
import { ESCROW_DEALS, CURRENCIES } from "enums";

import enumsValidator from "helpers/yup/enumsValidator";

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
  currency: enumsValidator(CURRENCIES).required().label("Currency"),
};

const escrowCreateSchema = object().shape({
  name: string().required().max(50).label("Name"),
  description: string().required().max(500).label("Description"),
  counterpartyAddress: string().required().label("Counterparty Adress"),
  dealType: enumsValidator(ESCROW_DEALS).required().label("Deal type"),

  file: mixed()
    .when("dealType", ([dealType], schema) => {
      return [ESCROW_DEALS.file_to_funds, ESCROW_DEALS.file_to_file].includes(
        dealType
      )
        ? schema.required()
        : schema.notRequired();
    })
    .label("File"),

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
