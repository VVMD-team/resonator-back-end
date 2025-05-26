import { object, string } from "yup";

const createConversationShema = object().shape({
  participantWalletAddress: string()
    .required()
    .label("Participant Wallet Address")
    .matches(/^0x/, "Participant Wallet Address must start with '0x'"),
});

export default createConversationShema;
