import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { getParticipantsConversationByID } from "firebase-api/chat";

import { ParticipantID, ConversationID } from "custom-types/chat";

import { mapConversationToDTO } from "utils/chat/mappers";

export default async function getConversationByID(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { conversationId } = req.query as { conversationId?: string };

  if (!conversationId) {
    return res.status(400).send({ message: "Conversation ID is required" });
  }

  try {
    const participantId = req.userId as ParticipantID;

    const conversation = await getParticipantsConversationByID({
      conversationId: conversationId as ConversationID,
      participantId,
    });

    const conversationDTO = mapConversationToDTO(conversation, participantId);

    return res.status(200).send(conversationDTO);
  } catch (error) {
    next(error);
  }
}
