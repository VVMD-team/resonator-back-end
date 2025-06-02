import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";
import { shareFileToAnotherUser, checkIsUsersFile } from "firebase-api/file";
import { shareTransferFileSchema } from "schemas";

import { ValidationError } from "yup";
import formatYupError from "helpers/yup/formatYupError";

import { mapFileToDTO } from "utils/file/mappers";

import { createMessage } from "firebase-api/chat";
import { MessageType, ConversationID } from "custom-types/chat";
import sendChatMessageToParticipant from "utils/chat/sendChatMessageToParticipant";

export default async function shareFile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const recryptedFile = req.file
      ? (req.file as Express.Multer.File)
      : undefined;

    if (!recryptedFile) {
      return res.status(400).send({ message: "File is required" });
    }

    const {
      recipientWalletPublicKey,
      fileId,
      encryptedIvBase64,
      encryptedAesKeys: encryptedAesKeysField,
      senderPublicKeyHex,
      conversationId,
    } = req.body;

    let encryptedAesKeys;
    try {
      encryptedAesKeys = JSON.parse(encryptedAesKeysField);
    } catch (error) {
      return res.status(400).send({ message: "Invalid Encrypted Aes Keys" });
    }

    const payload = {
      recipientWalletPublicKey,
      fileId,
      encryptedIvBase64,
      encryptedAesKeys,
      senderPublicKeyHex,

      conversationId,
    };
    await shareTransferFileSchema.validate(payload);

    const userId = req.userId as string;

    const isUsersFile = await checkIsUsersFile(fileId, userId);

    if (!isUsersFile) {
      res
        .status(500)
        .send({ result: false, message: "Something went wrong..." });
    }

    const recipientWalletPublicKeyInLowerCase = recipientWalletPublicKey
      .trim()
      .toLowerCase();

    const sharedFile = await shareFileToAnotherUser({
      recipientWalletPublicKey: recipientWalletPublicKeyInLowerCase,
      fileId,
      fileBuffer: recryptedFile.buffer,
      encryptedIvBase64,
      encryptedAesKeys,
      senderPublicKeyHex,
    });

    const sharedFileDTO = mapFileToDTO(sharedFile);

    if (conversationId) {
      const message = await createMessage({
        conversationId: conversationId as ConversationID,
        senderWalletAddress: userId,
        content: "File successfully shared.",
        messageType: MessageType.SYSTEM,
      });

      sendChatMessageToParticipant(
        message,
        recipientWalletPublicKeyInLowerCase
      );

      return res
        .status(200)
        .send({ message, sharedFile: sharedFileDTO, result: true });
    }

    return res.status(200).send({ sharedFile: sharedFileDTO, result: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json(formatYupError(error));
    }

    next(error);
  }
}
