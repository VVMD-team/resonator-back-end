import { db } from "config/firebase";
import { Conversation, ConversationID } from "custom-types/chat";
import { COLLECTIONS } from "enums";

import { ParticipantID } from "custom-types/chat";

export default async function getAllParticipantsConversations(
  participantId: ParticipantID
): Promise<Conversation[]> {
  try {
    const snapshot = await db
      .collection(COLLECTIONS.conversations)
      .where("participantIds", "array-contains", participantId)
      .get();

    const conversations = snapshot.docs.map((doc) => {
      const data = doc.data() as Conversation;

      const conversation: Conversation = {
        id: doc.id as ConversationID,
        title: data.title,
        creatorId: data.creatorId,
        participantIds: data.participantIds,
        lastMessageAt: data.lastMessageAt ?? undefined,
        deleteAt: data.deleteAt ?? null,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };

      return conversation;
    });

    return conversations;
  } catch (error) {
    throw new Error(
      `Something went wrong when fetching conversations. Error: ${error}`
    );
  }
}
