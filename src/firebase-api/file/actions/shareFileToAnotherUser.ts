import { BOX_TYPES, COLLECTIONS } from "enums";
import { getUserByPublicKey } from "firebase-api/user";
import { db } from "config/firebase";

import { updateBoxSize } from "firebase-api/box";
import { replaceFileInStorage } from "storage/pinata";

import { getFileById } from "firebase-api/file";

import { Base64String } from "custom-types/helpers";

type ShareFileToAnotherUserData = {
  recipientWalletPublicKey: string;
  fileId: string;

  fileBuffer?: Buffer;
  encryptedIvBase64?: Base64String;
  encryptedAesKeys?: Record<string, Base64String>;
  senderPublicKeyHex?: string;
};

export default async function shareFileToAnotherUser({
  recipientWalletPublicKey,
  fileId,

  fileBuffer,
  encryptedIvBase64,
  encryptedAesKeys,
  senderPublicKeyHex,
}: ShareFileToAnotherUserData) {
  const sharedUserData = await getUserByPublicKey(recipientWalletPublicKey);

  if (!sharedUserData?.boxIds || !sharedUserData?.boxIds.length) {
    throw new Error("No boxes found for the user");
  }

  const sharedBoxId = await Promise.all(
    sharedUserData.boxIds.map(async (boxId) => {
      const boxDoc = await db.collection(COLLECTIONS.boxes).doc(boxId).get();
      return boxDoc.exists && boxDoc.data()?.type === BOX_TYPES.shared
        ? boxId
        : null;
    })
  ).then((results) => results.find((boxId) => boxId !== null));

  if (!sharedBoxId) {
    throw new Error("Shared box not found for the user");
  }

  const existedFile = await getFileById(fileId);

  if (!existedFile) {
    throw new Error("File not found");
  }

  const sharedBoxDoc = await db
    .collection(COLLECTIONS.boxes)
    .doc(sharedBoxId)
    .get();
  const sharedBoxData = sharedBoxDoc.data();

  const sharedBoxFileIds = sharedBoxData?.fileIds;

  if (sharedBoxFileIds.includes(existedFile.id)) {
    throw new Error("You have already shared this file with this user");
  }

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

  const updatedFields = {
    ...(newIpfsHash && { ipfsHash: newIpfsHash }),
    ...(encryptedIvBase64 && { encryptedIvBase64 }),
    ...(encryptedAesKeys && { encryptedAesKeys }),
    ...(senderPublicKeyHex && { senderPublicKeyHex }),
    ownerIds: [...existedFile.ownerIds, sharedUserData.id],
  };

  await db
    .collection(COLLECTIONS.files)
    .doc(existedFile.id)
    .update(updatedFields);

  await db
    .collection(COLLECTIONS.boxes)
    .doc(sharedBoxId)
    .update({ fileIds: [...sharedBoxFileIds, existedFile.id] });

  await updateBoxSize(sharedBoxId);

  return {
    ...existedFile,
    ...updatedFields,
  };
}
