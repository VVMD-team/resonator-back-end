import { db } from "config/firebase";

import { Message, MessageType, ConversationID } from "custom-types/chat";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "enums";

import updateConversationLastMessageData from "./updateConversationLastMessageData";

type CreateMessageData = {
  conversationId: ConversationID;
  senderWalletAddress: string;
  content: string;
  messageType?: MessageType;
};

export default async function createMessage({
  conversationId,
  senderWalletAddress,
  content,
  messageType = MessageType.TEXT,
}: CreateMessageData): Promise<Message> {
  const newMessage = {
    conversationId: conversationId,
    senderWalletAddress,
    content: content,

    type: messageType,
    createdAt: FieldValue.serverTimestamp() as Timestamp,
  };

  const docRef = await db.collection(COLLECTIONS.messages).add(newMessage);

  const newMessageData = (await docRef.get()).data() as Message;

  await updateConversationLastMessageData({
    conversationId: conversationId,
    lastMessageAt: newMessageData.createdAt,
    lastMessageText: newMessageData.content,
  });

  return { ...newMessageData, id: docRef.id };
}
