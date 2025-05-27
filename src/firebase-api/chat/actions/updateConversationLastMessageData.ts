import { db } from "config/firebase";

import { ConversationID } from "custom-types/chat";
import { Timestamp } from "firebase-admin/firestore";

import { COLLECTIONS } from "enums";

type UpdateConversationLastMessageData = {
  conversationId: ConversationID;
  lastMessageAt: Timestamp;
  lastMessageText: string;
};

export default async function updateConversationLastMessageData({
  conversationId,
  lastMessageAt,
  lastMessageText,
}: UpdateConversationLastMessageData): Promise<void> {
  try {
    const docRef = db.collection(COLLECTIONS.conversations).doc(conversationId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new Error(`Conversation with ID "${conversationId}" not found`);
    }

    await docRef.update({
      lastMessageAt,
      lastMessageText,
    });
  } catch (error) {
    throw new Error(
      `Something went wrong with updating conversation last message data. Error: ${error}`
    );
  }
}
