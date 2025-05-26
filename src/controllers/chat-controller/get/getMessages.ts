import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { getMessages as getMessagesFromDB } from "firebase-api/chat";

import { ConversationID } from "custom-types/chat";

export default async function getMessages(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { conversationId } = req.query as { conversationId?: string };

  if (!conversationId) {
    return res.status(400).send({ message: "Conversation ID is required" });
  }

  try {
    const messages = await getMessagesFromDB(conversationId as ConversationID);

    return res.status(200).send(messages);
  } catch (error) {
    next(error);
  }
}
