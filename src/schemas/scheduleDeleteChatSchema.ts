import { object, string, number } from "yup";

const scheduleDeleteChatSchema = object().shape({
  conversationId: string().required().label("Conversation ID"),
  timestamp: number().positive().integer().required().label("Timestamp"),
});

export default scheduleDeleteChatSchema;
