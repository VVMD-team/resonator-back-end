import { db } from "config/firebase";
import { Message, ConversationID } from "custom-types/chat";
import { COLLECTIONS } from "enums";

export default async function getMessages(
  conversationId: ConversationID
): Promise<Message[]> {
  try {
    const snapshot = await db
      .collection(COLLECTIONS.messages)
      .where("conversationId", "==", conversationId)
      .orderBy("createdAt", "desc")
      .get();

    const messages: Message[] = snapshot.docs.map((doc) => {
      const data = doc.data() as Message;

      return { ...data, id: doc.id };
    });

    return messages;
  } catch (error) {
    throw new Error(
      `Something went wrong when fetching messages for conversation ${conversationId}: ${error}`
    );
  }
}
