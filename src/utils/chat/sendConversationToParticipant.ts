import { sendMessageToUser } from "websocket-server";
import { WS_DATA_TYPES } from "enums/index";

import { Conversation } from "custom-types/chat";

export default async function sendConversationToParticipant(
  conversation: Conversation,
  participantWalletAddress: string
) {
  const conversationWithWSDataType = {
    ...conversation,
    wsDataType: WS_DATA_TYPES.conversation,
  };

  sendMessageToUser({
    userId: participantWalletAddress,
    message: JSON.stringify(conversationWithWSDataType),
  });
}
