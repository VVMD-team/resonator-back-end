import { db } from "config/firebase";

import {
  Message,
  ParticipantID,
  MessageType,
  ConversationID,
} from "custom-types/chat";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "enums";

import updateConversationLastMessageData from "./updateConversationLastMessageData";

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
    // console.log({ newMessageData });
    // console.log(data.conversationId);
    await updateConversationLastMessageData({
      conversationId: data.conversationId,
      lastMessageAt: newMessageData.createdAt,
      lastMessageText: newMessageData.content,
    });

    return { ...newMessageData, id: docRef.id };
  } catch (error) {
    throw new Error(
      `Something went wrong with creating message. Error: ${error}`
    );
  }
}
