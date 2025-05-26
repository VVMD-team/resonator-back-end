import { db } from "config/firebase";
import { Conversation, ConversationID, ParticipantID } from "custom-types/chat";
import { COLLECTIONS } from "enums";

type Params = {
  conversationId: ConversationID;
  participantId: ParticipantID;
};

export default async function getParticipantsConversationByID({
  conversationId,
  participantId,
}: Params): Promise<Conversation> {
  try {
    const docRef = db.collection(COLLECTIONS.conversations).doc(conversationId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new Error(`Conversation with ID "${conversationId}" not found`);
    }

    const data = docSnap.data() as Conversation;

    const conversation: Conversation = {
      id: docSnap.id as ConversationID,
      title: data.title,
      creatorId: data.creatorId,
      participantIds: data.participantIds,
      lastMessageAt: data.lastMessageAt ?? undefined,
      deleteAt: data.deleteAt ?? null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    if (!conversation.participantIds.includes(participantId)) {
      throw new Error(`Conversation with ID "${conversationId}" not found`);
    }

    return conversation;
  } catch (error) {
    throw new Error(
      `Something went wrong while fetching conversation ${conversationId}: ${error}`
    );
  }
}
