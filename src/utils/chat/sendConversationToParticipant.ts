import { sendMessageToUser } from "websocket-server";
import { WS_DATA_TYPES } from "enums/index";

import { Conversation } from "custom-types/chat";
import { ParticipantID } from "custom-types/chat";

import { mapConversationToDTO } from "./mappers";

export default async function sendConversationToParticipant(
  conversation: Conversation,
  participantWalletAddress: ParticipantID
) {
  const conversationDTO = mapConversationToDTO(
    conversation,
    participantWalletAddress
  );

  const conversationWithWSDataType = {
    ...conversationDTO,
    wsDataType: WS_DATA_TYPES.conversation,
  };

  sendMessageToUser({
    userId: participantWalletAddress,
    message: JSON.stringify(conversationWithWSDataType),
  });
}
