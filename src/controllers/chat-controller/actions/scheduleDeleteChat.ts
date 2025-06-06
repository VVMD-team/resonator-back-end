import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import {
  deleteChat as deleteChatInDB,
  updateConversationDeleteAt,
} from "firebase-api/chat";

import { ParticipantID } from "custom-types/chat";
import { Timestamp } from "firebase-admin/firestore";

import { scheduleDeleteChatSchema } from "schemas";
import { ValidationError } from "yup";
import formatYupError from "helpers/yup/formatYupError";

import { scheduleTimeout } from "utils/timeoutManager";
import { UtcTimestamp } from "custom-types/helpers";

import sendDeleteConversationIdToParticipant from "utils/chat/sendDeleteConversationIdToParticipant";
import sendUpdateConversationToParticipant from "utils/chat/sendUpdateConversationToParticipant";

export default async function scheduleDeleteChat(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { conversationId, timestamp } = req.body;

  try {
    const payload = { conversationId, timestamp: Number(timestamp) };
    await scheduleDeleteChatSchema.validate(payload);

    const userId = req.userId as ParticipantID;

    const { participantIds: updatedConversationParticipantIds } =
      await updateConversationDeleteAt({
        conversationId,
        timestamp: timestamp as UtcTimestamp,
      });

    await Promise.all(
      updatedConversationParticipantIds.map(async (participantId) => {
        await sendUpdateConversationToParticipant(
          conversationId,
          {
            deleteAt: Timestamp.fromMillis(timestamp),
          },
          participantId
        );
      })
    );

    scheduleTimeout(conversationId, timestamp, async () => {
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
    });

    return res.status(200).send({ result: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(formatYupError(error));
    }

    next(error);
  }
}
