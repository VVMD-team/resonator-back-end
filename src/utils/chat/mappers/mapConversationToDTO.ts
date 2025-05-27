import { Conversation } from "custom-types/chat";
import { ParticipantID } from "custom-types/chat";

export default function mapConversationToDTO(
  conversation: Conversation,
  currentParticipantId: ParticipantID
) {
  const correspondentAddress = conversation.participantIds
    .filter((participantId) => participantId !== currentParticipantId)
    .join(", ");

  const title = conversation.title || correspondentAddress;

  return {
    id: conversation.id,
    title,
    correspondentAddress,
    lastMessageAt: conversation.lastMessageAt,
    lastMessageText: conversation.lastMessageText,
    updatedAt: conversation.updatedAt,
  };
}
