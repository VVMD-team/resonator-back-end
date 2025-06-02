import { object, string } from "yup";

const delegateChatSchema = object().shape({
  conversationId: string().required().label("Conversation ID"),
  delegateeId: string().required().label("Participant Wallet Address"),
});

export default delegateChatSchema;
