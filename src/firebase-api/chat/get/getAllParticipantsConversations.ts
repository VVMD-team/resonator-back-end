import { db } from "config/firebase";
import { Conversation, ConversationID } from "custom-types/chat";
import { COLLECTIONS } from "enums";

import { ParticipantID } from "custom-types/chat";

type SearchParams = {
  keyword: string;
};

type Params = {
  participantId: ParticipantID;
  searchParams?: SearchParams;
};

export default async function getAllParticipantsConversations({
  participantId,
  searchParams,
}: Params): Promise<Conversation[]> {
  try {
    const snapshot = await db
      .collection(COLLECTIONS.conversations)
      .where("participantIds", "array-contains", participantId)
      .orderBy("updatedAt", "desc")
      .get();

    if (searchParams?.keyword) {
      const conversationsFiltered = snapshot.docs.reduce(
        (acc: Conversation[], doc) => {
          const data = doc.data() as Conversation;

          if (
            data.title &&
            data.title
              .toLowerCase()
              .includes(searchParams.keyword.toLowerCase())
          ) {
            return [...acc, { ...data, id: doc.id as ConversationID }];
          }

          const participantIdsForSearch = data.participantIds.filter(
            (id) => id !== participantId
          );

          const matched = participantIdsForSearch.some((id) =>
            id.toLowerCase().includes(searchParams.keyword.toLowerCase())
          );

          if (matched) {
            return [...acc, { ...data, id: doc.id as ConversationID }];
          }

          return acc;
        },
        []
      );

      return conversationsFiltered;
    }

    const conversations = snapshot.docs.map((doc) => {
      const data = doc.data() as Conversation;

      return { ...data, id: doc.id as ConversationID };
    });

    return conversations;
  } catch (error) {
    throw new Error(
      `Something went wrong when fetching conversations. Error: ${error}`
    );
  }
}
