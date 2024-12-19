import { object, string, mixed, number } from "yup";
import { ESCROW_DEALS, CURRENCIES } from "enums";

import enumsValidator from "helpers/yup/enumsValidator";

const paymentSchema = {
  amount: number().required().positive().label("Amount"),
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

  previdedPayment: object()
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
