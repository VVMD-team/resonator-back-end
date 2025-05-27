import { sendMessageToUser } from "websocket-server";
import { WS_DATA_TYPES } from "enums/index";

import { Message } from "custom-types/chat";

export default async function sendChatMessageToParticipant(
  message: Message,
  participantWalletAddress: string
) {
  const messageWithWSDataType = {
    ...message,
    wsDataType: WS_DATA_TYPES.message,
  };

  sendMessageToUser({
    userId: participantWalletAddress,
    message: JSON.stringify(messageWithWSDataType),
  });
}
