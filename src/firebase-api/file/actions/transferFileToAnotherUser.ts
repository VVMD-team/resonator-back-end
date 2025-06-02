import { BOX_TYPES, COLLECTIONS } from "enums";
import { getUserById, getUserByPublicKey } from "firebase-api/user";
import { db } from "config/firebase";

import { Box } from "custom-types/Box";

import { updateBoxSize } from "firebase-api/box";
import { replaceFileInStorage } from "storage/pinata";

import { getFileById } from "firebase-api/file";

import { Base64String } from "custom-types/helpers";

type TransferFileToAnotherUserData = {
  senderUserId: string;
  recipientWalletPublicKey: string;
  fileId: string;

  fileBuffer?: Buffer;
  encryptedIvBase64?: Base64String;
  encryptedAesKeys?: Record<string, Base64String>;
  senderPublicKeyHex?: string;

  transferBoxType?: BOX_TYPES;
};

export default async function transferFileToAnotherUser({
  senderUserId,
  recipientWalletPublicKey,
  fileId,

  fileBuffer,
  encryptedIvBase64,
  encryptedAesKeys,
  senderPublicKeyHex,

  transferBoxType = BOX_TYPES.transfered,
}: TransferFileToAnotherUserData) {
  const recipientUserData = await getUserByPublicKey(recipientWalletPublicKey);

  const currentUser = await getUserById(senderUserId);

  if (!currentUser) {
    throw new Error("User not found");
  }

  if (!recipientUserData?.boxIds || !recipientUserData?.boxIds.length) {
    throw new Error("No boxes found for the user");
  }

  const transferedBoxId = await Promise.all(
    recipientUserData.boxIds.map(async (boxId) => {
      const boxDoc = await db.collection(COLLECTIONS.boxes).doc(boxId).get();
      return boxDoc.exists && boxDoc.data()?.type === transferBoxType
        ? boxId
        : null;
    })
  ).then((results) => results.find((boxId) => boxId !== null));

  if (!transferedBoxId) {
    throw new Error("Transfered box not found for the user");
  }

  const existedFile = await getFileById(fileId);

  if (!existedFile) {
    throw new Error("File not found");
  }

  const transferedBoxDoc = await db
    .collection(COLLECTIONS.boxes)
    .doc(transferedBoxId)
    .get();
  const transferedBoxData = transferedBoxDoc.data() as Box;

  const transferedFileIds = transferedBoxData?.fileIds;

  if (transferedFileIds.includes(existedFile.id)) {
    throw new Error("You have already transfered this file with this user");
  }

  const currentUserBoxIds = currentUser.boxIds;

  await Promise.all(
    currentUserBoxIds.map(async (boxId) => {
      await db.runTransaction(async (transaction) => {
        const boxRef = db.collection(COLLECTIONS.boxes).doc(boxId);
        const boxDoc = await transaction.get(boxRef);

        if (!boxDoc.exists) {
          throw new Error("Box does not exist.");
        }

        const boxData = boxDoc.data() as Box;

        if (boxData.fileIds.includes(fileId)) {
          transaction.update(boxRef, {
            fileIds: boxData.fileIds.filter((id) => id !== fileId),
          });
        }
      });
    })
  );

  let newIpfsHash;
  if (
    fileBuffer &&
    encryptedIvBase64 &&
    encryptedAesKeys &&
    senderPublicKeyHex
  ) {
    const { IpfsHash } = await replaceFileInStorage({
      fileBuffer,
      originalName: existedFile.name,
      mimeType: existedFile.mimetype,
      fileCid: existedFile.ipfsHash,
    });
    newIpfsHash = IpfsHash;
  }

  await db
    .collection(COLLECTIONS.files)
    .doc(existedFile.id)
    .update({
      ...(newIpfsHash && { ipfsHash: newIpfsHash }),
      ...(encryptedIvBase64 && { encryptedIvBase64 }),
      ...(encryptedAesKeys && { encryptedAesKeys }),
      ...(senderPublicKeyHex && { senderPublicKeyHex }),
      ownerIds: [
        ...existedFile.ownerIds.filter((id) => id !== senderUserId),
        recipientUserData.id,
      ],
    });

  await db
    .collection(COLLECTIONS.boxes)
    .doc(transferedBoxId)
    .update({ fileIds: [...transferedFileIds, existedFile.id] });

  await updateBoxSize(transferedBoxId);

  return existedFile;
}
