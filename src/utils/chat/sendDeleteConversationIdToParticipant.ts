import { sendMessageToUser } from "websocket-server";
import { WS_DATA_TYPES } from "enums/index";

import { ConversationID } from "custom-types/chat";

export default async function sendDeleteConversationIdToParticipant(
  conversationId: ConversationID,
  participantWalletAddress: string
) {
  const dataWithWSDataType = {
    conversationId,
    wsDataType: WS_DATA_TYPES.delete_conversation,
  };

  sendMessageToUser({
    userId: participantWalletAddress,
    message: JSON.stringify(dataWithWSDataType),
  });
}
