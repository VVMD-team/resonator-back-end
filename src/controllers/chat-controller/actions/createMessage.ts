import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { createMessage as createMessageInDB } from "firebase-api/chat";

import { createMessageSchema } from "schemas";
import { ValidationError } from "yup";
import formatYupError from "helpers/yup/formatYupError";

import sendChatMessageToParticipant from "utils/chat/sendChatMessageToParticipant";

export default async function createMessage(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { conversationId, content, participantWalletAddress } = req.body;

  try {
    const payload = { conversationId, content, participantWalletAddress };
    await createMessageSchema.validate(payload);

    const userId = req.userId as string;

    const message = await createMessageInDB({
      conversationId,
      senderWalletAddress: userId,
      content,
    });

    sendChatMessageToParticipant(message, participantWalletAddress);

    return res.status(200).send(message);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(formatYupError(error));
    }

    next(error);
  }
}
