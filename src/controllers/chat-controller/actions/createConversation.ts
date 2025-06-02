import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { getUserByPublicKey } from "firebase-api/user";
import { createConversation as createConversationInDB } from "firebase-api/chat";

import { ParticipantID } from "custom-types/chat";

import { createConversationShema } from "schemas";
import { ValidationError } from "yup";
import formatYupError from "helpers/yup/formatYupError";

import sendConversationToParticipant from "utils/chat/sendConversationToParticipant";

import { mapConversationToDTO } from "utils/chat/mappers";

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
      participantWalletAddress.toLowerCase() as ParticipantID;

    const userId = req.userId as string;
    const creatorWalletAddressLowerCase = userId.toLowerCase() as ParticipantID;

    if (participantWalletAddressLowerCase === creatorWalletAddressLowerCase) {
      return res.status(400).send({
        message: "You can not create chat with yourself",
      });
    }

    await getUserByPublicKey(participantWalletAddressLowerCase);

    const conversation = await createConversationInDB({
      creatorId: creatorWalletAddressLowerCase,
      participantId: participantWalletAddressLowerCase,
    });

    sendConversationToParticipant(
      conversation,
      participantWalletAddressLowerCase
    );

    const conversationDTO = mapConversationToDTO(
      conversation,
      creatorWalletAddressLowerCase
    );

    return res.status(200).send(conversationDTO);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(formatYupError(error));
    }

    next(error);
  }
}
