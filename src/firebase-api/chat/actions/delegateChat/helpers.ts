import { db } from "config/firebase";

import { Conversation, ParticipantID, ConversationID } from "custom-types/chat";

import { COLLECTIONS } from "enums";

export type DelegateData = {
  delegatorId: ParticipantID;
  delegateeId: ParticipantID;
  conversationId: ConversationID;
};

export async function delegateConversation({
  delegatorId,
  delegateeId,
  conversationId,
}: DelegateData) {
  const docRef = db.collection(COLLECTIONS.conversations).doc(conversationId);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    throw new Error(`Conversation ${conversationId} not found.`);
  }

  const data = docSnap.data() as Conversation;

  if (!data || !Array.isArray(data.participantIds)) {
    throw new Error(`participantIds is missing or invalid.`);
  }

  if (!data.participantIds.includes(delegatorId)) {
    throw new Error(`delegatorId: ${delegatorId} not found in participantIds.`);
  }

  if (data.participantIds.includes(delegateeId)) {
    throw new Error(
      `delegateeId: ${delegateeId} already exists in participantIds.`
    );
  }

  const updatedParticipantIds = data.participantIds.map((id) =>
    id === delegatorId ? delegateeId : id
  );

  await docRef.update({ participantIds: updatedParticipantIds });

  return {
    result: true,
    delegatedConversation: { ...data, id: docSnap.id as ConversationID },
  };
}

export async function delegateMessages({
  delegatorId,
  delegateeId,
  conversationId,
}: DelegateData) {
  const batch = db.batch();

  const snapshot = await db
    .collection(COLLECTIONS.messages)
    .where("conversationId", "==", conversationId)
    .where("senderWalletAddress", "==", delegatorId)
    .get();

  if (snapshot.empty) {
    console.log(
      `no messages to delegate for conversationId: "${conversationId}"`
    );
    return { result: true };
  }

  snapshot.docs.forEach((doc) => {
    const messageRef = doc.ref;
    batch.update(messageRef, { senderWalletAddress: delegateeId });
  });

  await batch.commit();

  return { result: true };
}
