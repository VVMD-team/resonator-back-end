import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { updateConversationDeleteAt } from "firebase-api/chat";

import { ValidationError } from "yup";
import formatYupError from "helpers/yup/formatYupError";

import {
  cancelScheduledTimeout,
  getScheduledTimeouts,
} from "utils/timeoutManager";

import sendUpdateConversationToParticipant from "utils/chat/sendUpdateConversationToParticipant";

export default async function cancelScheduledDeleteChat(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { conversationId } = req.body;

  if (!conversationId) {
    return res.status(400).send({ message: "Conversation ID is required" });
  }

  try {
    console.log(getScheduledTimeouts());
    const isCancelled = cancelScheduledTimeout(conversationId);

    if (isCancelled) {
      const { participantIds: updatedConversationParticipantIds } =
        await updateConversationDeleteAt({
          conversationId,
          timestamp: null,
        });

      await Promise.all(
        updatedConversationParticipantIds.map(async (participantId) => {
          await sendUpdateConversationToParticipant(
            conversationId,
            { deleteAt: null },
            participantId
          );
        })
      );
    } else {
      return res.status(200).send({ result: false });
    }

    return res.status(200).send({ result: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(formatYupError(error));
    }

    next(error);
  }
}
