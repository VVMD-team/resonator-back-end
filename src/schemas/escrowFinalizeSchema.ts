import { object, string } from "yup";
import { ESCROW_DEALS } from "enums";

import enumsValidator from "helpers/yup/enumsValidator";

const escrowFinalizeSchema = object().shape({
  escrowId: string().required().label("Escrow Id"),
  dealType: enumsValidator(ESCROW_DEALS).required().label("Deal type"),
  orderContractId: string().required().label("Order Contract Id"),
});

export default escrowFinalizeSchema;
