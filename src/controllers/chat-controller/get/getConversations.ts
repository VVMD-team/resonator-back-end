import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { getAllParticipantsConversations } from "firebase-api/chat";

import { ParticipantID } from "custom-types/chat";

import { mapConversationToDTO } from "utils/chat/mappers";

export default async function getConversations(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const participantId = req.userId as ParticipantID;

    const conversations = await getAllParticipantsConversations(participantId);

    const conversationsDTO = conversations.map((conversation) =>
      mapConversationToDTO(conversation, participantId)
    );

    return res.status(200).send(conversationsDTO);
  } catch (error) {
    next(error);
  }
}
