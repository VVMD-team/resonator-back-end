import { db } from "config/firebase";

import { Conversation, ParticipantID, ConversationID } from "custom-types/chat";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "enums";

type CreateConversationData = {
  title?: string;
  creatorId: ParticipantID;
  participantId: ParticipantID;
};

export default async function createConversation({
  title,
  creatorId,
  participantId,
}: CreateConversationData): Promise<Conversation> {
  const snapshot = await db
    .collection(COLLECTIONS.conversations)
    .where("participantIds", "array-contains", creatorId)
    .get();

  const isAlreadyCreacted = !!snapshot.docs.find((doc) => {
    const data = doc.data() as Conversation;
    console.log(data);

    return data.participantIds.includes(participantId);
  });

  if (isAlreadyCreacted) {
    throw new Error(`You already have conversation with this user`);
  }

  const currentTimestamp = FieldValue.serverTimestamp() as Timestamp;

  const newConversation = {
    title: title || participantId,
    creatorId: creatorId,
    participantIds: [creatorId, participantId],

    deleteAt: null,
    createdAt: currentTimestamp,
    updatedAt: currentTimestamp,
  };

  const docRef = await db
    .collection(COLLECTIONS.conversations)
    .add(newConversation);

  const newConversationData = (await docRef.get()).data() as Conversation;

  const conversationId = docRef.id as ConversationID;

  return { ...newConversationData, id: conversationId };
}
