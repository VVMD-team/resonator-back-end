import { db } from "config/firebase";

import { Conversation, ParticipantID, ConversationID } from "custom-types/chat";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "enums";

type CreateConversationData = {
  title?: string;
  creatorId: ParticipantID;
  participantId: ParticipantID;
};

export default async function createConversation(
  data: CreateConversationData
): Promise<Conversation> {
  try {
    const currentTimestamp = FieldValue.serverTimestamp() as Timestamp;

    const newConversation = {
      title: data.title || "",
      creatorId: data.creatorId,
      participantIds: [data.creatorId, data.participantId],

      deleteAt: null,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
    };

    const docRef = await db
      .collection(COLLECTIONS.conversations)
      .add(newConversation);

    const conversationId = docRef.id as ConversationID;

    return { id: conversationId, ...newConversation };
  } catch (error) {
    throw new Error(`Something went wrong with creating chat. Error: ${error}`);
  }
}
