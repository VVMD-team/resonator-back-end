import { db } from "config/firebase";

import {
  Message,
  ParticipantID,
  MessageType,
  ConversationID,
} from "custom-types/chat";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "enums";

type CreateMessageData = {
  conversationId: ConversationID;
  senderWalletAddress: string;
  content: string;
};

export default async function createMessage(
  data: CreateMessageData
): Promise<Message> {
  try {
    const senderWalletAddress = data.senderWalletAddress as ParticipantID;

    const conversationDocSnap = await db
      .collection(COLLECTIONS.conversations)
      .doc(data.conversationId)
      .get();

    if (!conversationDocSnap.exists) {
      throw new Error(
        `Conversation with ID "${data.conversationId}" not found`
      );
    }

    const newMessage = {
      conversationId: data.conversationId,
      senderWalletAddress,
      content: data.content,
      readBy: [senderWalletAddress],

      type: MessageType.TEXT,
      createdAt: FieldValue.serverTimestamp() as Timestamp,
    };

    const docRef = await db.collection(COLLECTIONS.messages).add(newMessage);

    const newMessageData = (await docRef.get()).data() as Message;

    const messageId = docRef.id;

    return { ...newMessageData, id: messageId };
  } catch (error) {
    throw new Error(
      `Something went wrong with creating message. Error: ${error}`
    );
  }
}
