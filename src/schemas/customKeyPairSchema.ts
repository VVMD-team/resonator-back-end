import { object, string } from "yup";

const customKeyPairSchema = object().shape({
  customPubKey: string().required().label("Custom Public Key"),
  customPrivKey: string().required().label("Custom Private Key"),
});

export default customKeyPairSchema;
