import { db } from "config/firebase";

import { ParticipantID, ConversationID, Conversation } from "custom-types/chat";
import { deleteChat as deleteChatInDB } from "firebase-api/chat";
import sendDeleteConversationIdToParticipant from "utils/chat/sendDeleteConversationIdToParticipant";

import { COLLECTIONS } from "enums";

import { scheduleTimeout, hasScheduledTimeout } from "utils/timeoutManager";

export default async function rescheduleTimeouts() {
  const snapshot = await db.collection(COLLECTIONS.conversations).get();

  snapshot.docs.map((doc) => {
    const { deleteAt, participantIds } = doc.data() as Conversation;

    if (deleteAt && !hasScheduledTimeout(doc.id)) {
      const timestamp = deleteAt.toMillis();

      scheduleTimeout(doc.id, timestamp, async () => {
        const conversationId = doc.id as ConversationID;

        const { participantIds: deletedConversationParticipantIds } =
          await deleteChatInDB({
            participantId: participantIds[0] as ParticipantID,
            conversationId,
          });

        await Promise.all(
          deletedConversationParticipantIds.map(async (participantId) => {
            await sendDeleteConversationIdToParticipant(
              conversationId,
              participantId
            );
          })
        );
      });
    }
  });
}
