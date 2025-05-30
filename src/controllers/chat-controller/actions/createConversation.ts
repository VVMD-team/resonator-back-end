import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { getUserByPublicKey } from "firebase-api/user";
import { createConversation as createConversationInDB } from "firebase-api/chat";

import { ParticipantID } from "custom-types/chat";

import { createConversationShema } from "schemas";
import { ValidationError } from "yup";
import formatYupError from "helpers/yup/formatYupError";

import sendConversationToParticipant from "utils/chat/sendConversationToParticipant";

export default async function createConversation(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { participantWalletAddress } = req.body;

  try {
    const payload = { participantWalletAddress };
    await createConversationShema.validate(payload);

    const participantWalletAddressLowerCase =
      participantWalletAddress.toLowerCase();

    const userId = req.userId as string;
    const creatorWalletAddressLowerCase = userId.toLowerCase();

    if (participantWalletAddressLowerCase === creatorWalletAddressLowerCase) {
      return res.status(400).send({
        message: "You can not create chat with yourself",
      });
    }

    await getUserByPublicKey(participantWalletAddressLowerCase);

    const conversation = await createConversationInDB({
      creatorId: creatorWalletAddressLowerCase as ParticipantID,
      participantId: participantWalletAddressLowerCase as ParticipantID,
    });

    sendConversationToParticipant(conversation, participantWalletAddress);

    return res.status(200).send(conversation);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(formatYupError(error));
    }

    next(error);
  }
}
