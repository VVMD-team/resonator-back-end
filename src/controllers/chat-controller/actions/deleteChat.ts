import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { deleteChat as deleteChatInDB } from "firebase-api/chat";

import { ParticipantID } from "custom-types/chat";

import { deleteChatSchema } from "schemas";
import { ValidationError } from "yup";
import formatYupError from "helpers/yup/formatYupError";

import sendDeleteConversationIdToParticipant from "utils/chat/sendDeleteConversationIdToParticipant";

export default async function deleteChat(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { conversationId } = req.body;

  try {
    const payload = { conversationId };
    await deleteChatSchema.validate(payload);

    const userId = req.userId as ParticipantID;

    const { participantIds: deletedConversationParticipantIds } =
      await deleteChatInDB({
        participantId: userId,
        conversationId,
      });

    await Promise.all(
      deletedConversationParticipantIds.map(async (participantId) => {
        await sendDeleteConversationIdToParticipant(
          conversationId,
          participantId
        );
      })
    );

    return res.status(200).send({ result: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(formatYupError(error));
    }

    next(error);
  }
}
