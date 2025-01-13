import { object, string } from "yup";
import { ESCROW_DEALS } from "enums";

import enumsValidator from "helpers/yup/enumsValidator";

const escrowCheckValiditySchema = object().shape({
  escrowId: string().required().label("Escrow Id"),
  dealType: enumsValidator(ESCROW_DEALS).required().label("Deal type"),
});

export default escrowCheckValiditySchema;
