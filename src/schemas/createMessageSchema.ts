import { object, string } from "yup";
import { MAX_MESSAGE_TEXT_LENGTH } from "const/index";

const createMessageSchema = object().shape({
  conversationId: string().required().label("Conversation ID"),
  participantWalletAddress: string()
    .required()
    .label("Participant Wallet Address"),
  content: string()
    .max(MAX_MESSAGE_TEXT_LENGTH)
    .required()
    .label("Message Content"),
});

export default createMessageSchema;
