import { sendMessageToUser, getUserConnectionsMap } from "websocket-server";

import { Message } from "custom-types/chat";

export default async function sendChatMessageToParticipant(
  message: Message,
  participantWalletAddress: string
) {
  sendMessageToUser({
    userId: participantWalletAddress,
    message: JSON.stringify(message),
  });
}
