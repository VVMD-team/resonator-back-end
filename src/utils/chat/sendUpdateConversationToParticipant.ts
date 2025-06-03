import { sendMessageToUser } from "websocket-server";
import { WS_DATA_TYPES } from "enums/index";

import { Conversation } from "custom-types/chat";
import { ParticipantID, ConversationID } from "custom-types/chat";

export default async function sendUpdateConversationToParticipant(
  conversationId: ConversationID,
  conversationFields: Partial<Conversation>,
  participantWalletAddress: ParticipantID
) {
  const conversationFieldsWithWSDataType = {
    id: conversationId,
    ...conversationFields,
    wsDataType: WS_DATA_TYPES.update_conversation,
  };

  sendMessageToUser({
    userId: participantWalletAddress,
    message: JSON.stringify(conversationFieldsWithWSDataType),
  });
}
