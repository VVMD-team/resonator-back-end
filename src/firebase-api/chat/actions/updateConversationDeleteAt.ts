import { db } from "config/firebase";

import { UtcTimestamp } from "custom-types/helpers";
import { ConversationID, Conversation } from "custom-types/chat";

import { COLLECTIONS } from "enums";

import { Timestamp } from "firebase-admin/firestore";

type UpdateConversationDeleteAtData = {
  conversationId: ConversationID;
  timestamp: UtcTimestamp | null;
};

export default async function updateConversationDeleteAt({
  conversationId,
  timestamp,
}: UpdateConversationDeleteAtData) {
  const docRef = db.collection(COLLECTIONS.conversations).doc(conversationId);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    throw new Error(`Conversation with ID "${conversationId}" not found`);
  }

  const deleteAt = timestamp ? Timestamp.fromMillis(timestamp) : null;

  await docRef.update({ deleteAt });

  const conversation = docSnap.data() as Conversation;

  const conversationUpdated = { ...conversation, deleteAt };

  return { ...conversationUpdated, id: docSnap.id as ConversationID };
}
