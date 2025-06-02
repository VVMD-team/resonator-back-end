import { object, string } from "yup";

const deleteChatSchema = object().shape({
  conversationId: string().required().label("Conversation ID"),
});

export default deleteChatSchema;
