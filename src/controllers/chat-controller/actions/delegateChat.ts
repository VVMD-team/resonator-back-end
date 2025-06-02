import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { delegateChat as delegateChatInDB } from "firebase-api/chat";

import { ParticipantID } from "custom-types/chat";

import { delegateChatSchema } from "schemas";
import { ValidationError } from "yup";
import formatYupError from "helpers/yup/formatYupError";

import sendConversationToParticipant from "utils/chat/sendConversationToParticipant";

export default async function delegateChat(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { conversationId, delegateeId } = req.body;

  try {
    const payload = { conversationId, delegateeId };
    await delegateChatSchema.validate(payload);

    const delegateeIdLowerCase = delegateeId.toLowerCase();

    const userId = req.userId as ParticipantID;

    if (delegateeIdLowerCase === userId) {
      return res
        .status(400)
        .json({ message: "You can not delegate to yourself" });
    }

    const { delegatedConversation } = await delegateChatInDB({
      delegatorId: userId,
      delegateeId: delegateeIdLowerCase,
      conversationId,
    });

    sendConversationToParticipant(delegatedConversation, delegateeIdLowerCase);

    return res.status(200).send({ result: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(formatYupError(error));
    }

    next(error);
  }
}
