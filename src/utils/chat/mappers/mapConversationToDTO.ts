import { Conversation } from "custom-types/chat";
import { ParticipantID } from "custom-types/chat";

export default function mapConversationToDTO(
  conversation: Conversation,
  currentParticipantId: ParticipantID
) {
  const correspondentAddress =
    conversation.title ||
    conversation.participantIds
      .filter((participantId) => participantId !== currentParticipantId)
      .join(", ");

  return {
    id: conversation.id,
    title: correspondentAddress,
    correspondentAddress,
    updatedAt: conversation.updatedAt,
  };
}
