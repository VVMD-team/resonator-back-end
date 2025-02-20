import { object, string } from "yup";
import enumsValidator from "helpers/yup/enumsValidator";

import { WALLETS } from "enums";

const authSchema = object().shape({
  walletPublicKey: string().required().label("Wallet Public Key"),
  signature: string().required().label("Signature"),
  walletType: enumsValidator(WALLETS).required().label("Wallet Type"),
});

export default authSchema;
