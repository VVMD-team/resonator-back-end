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

    if (!data.participantIds.includes(participantId)) {
      throw new Error(`Conversation with ID "${conversationId}" not found`);
    }

    return { ...data, id: docSnap.id as ConversationID };
  } catch (error) {
    throw new Error(
      `Something went wrong while fetching conversation ${conversationId}: ${error}`
    );
  }
}
