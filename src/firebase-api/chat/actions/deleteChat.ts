import { db } from "config/firebase";

import { ParticipantID, ConversationID, Conversation } from "custom-types/chat";

import { COLLECTIONS } from "enums";

type Params = {
  conversationId: ConversationID;
  participantId: ParticipantID;
};

export default async function deleteChat({
  conversationId,
  participantId,
}: Params) {
  const docRef = db.collection(COLLECTIONS.conversations).doc(conversationId);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    throw new Error(`Conversation with ID "${conversationId}" not found`);
  }

  const data = docSnap.data() as Conversation;

  if (!data.participantIds.includes(participantId)) {
    throw new Error(
      `You can not delete this conversation with ID "${conversationId}"`
    );
  }

  await docRef.delete();

  // Delete messages

  const BATCH_SIZE = 500;

  while (true) {
    const snapshot = await db
      .collection(COLLECTIONS.messages)
      .where("conversationId", "==", conversationId)
      .limit(BATCH_SIZE)
      .get();

    if (snapshot.empty) break;

    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

  return { ...data, id: docSnap.id as ConversationID };
}
