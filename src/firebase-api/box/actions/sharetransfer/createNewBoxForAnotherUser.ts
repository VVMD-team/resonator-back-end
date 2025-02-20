import { db } from "config/firebase";

import { BOX_TYPES, COLLECTIONS } from "enums";

import { Box } from "custom-types/Box";
import { File } from "custom-types/File";

import { createBox, updateBoxSize } from "firebase-api/box";

import { replaceFileInStorage } from "storage/pinata";

import {
  setBoxToUser,
  deleteBoxIdFromUser,
  getUserByPublicKey,
} from "firebase-api/user";

type ShareTransferFileData = {
  id: any;
  encryptedIvBase64: any;
  encryptedAesKeys: any;
  senderPublicKeyHex: any;
  fileBuffer: Buffer;
};

export type ShareTransferParams = {
  userId: string;
  recipientWalletPublicKey: string;
  boxId: string;
  filesData: ShareTransferFileData[];
};

export enum CreateNewBoxForAnotherUserActions {
  share = "share",
  transfer = "transfer",
}

export const createNewBoxForAnotherUser = async (
  { userId, recipientWalletPublicKey, boxId, filesData }: ShareTransferParams,
  action: CreateNewBoxForAnotherUserActions
) => {
  const sharedUserData = await getUserByPublicKey(recipientWalletPublicKey);

  if (!sharedUserData) {
    throw new Error("User not found");
  }

  if (sharedUserData.boxIds.includes(boxId)) {
    throw new Error(`You have already ${action}ed this box`);
  }

  const existingBoxRef = db.collection(COLLECTIONS.boxes).doc(boxId);
  const existingBoxDoc = await existingBoxRef.get();

  if (!existingBoxDoc.exists) {
    throw new Error(`Box with ID ${boxId} does not exist.`);
  }

  const existingBoxData = existingBoxDoc.data() as Box;

  if (existingBoxData.type !== BOX_TYPES.custom) {
    throw new Error("You can't share this box");
  }

  const filePromises = existingBoxData.fileIds.map(async (fileId) => {
    const fileRef = db.collection(COLLECTIONS.files).doc(fileId);
    const fileDoc = await fileRef.get();

    if (!fileDoc.exists) {
      throw new Error(`File with ID ${fileId} does not exist!`);
    }

    const fileData = fileDoc.data() as File;

    let ownerIds = fileData.ownerIds;

    ownerIds = [...ownerIds, sharedUserData.id];

    if (action === CreateNewBoxForAnotherUserActions.transfer) {
      ownerIds = ownerIds.filter((id) => id !== userId);
    }

    await fileRef.update({ ownerIds });
  });

  await Promise.all(filePromises);

  const filesPromises = filesData.map(
    async ({
      id,
      encryptedIvBase64,
      encryptedAesKeys,
      senderPublicKeyHex,
      fileBuffer,
    }) => {
      const fileRef = db.collection(COLLECTIONS.files).doc(id);

      const fileDoc = await fileRef.get();
      const fileData = fileDoc.data() as File;

      const { IpfsHash: newIpfsHash } = await replaceFileInStorage({
        fileBuffer,
        originalName: fileData.name,
        mimeType: fileData.mimetype,
        fileCid: fileData.ipfsHash,
      });

      await fileRef.update({
        encryptedIvBase64,
        encryptedAesKeys,
        senderPublicKeyHex,
        ipfsHash: newIpfsHash,
      });
    }
  );

  await Promise.all(filesPromises);

  const newBox = await createBox(existingBoxData.name, sharedUserData.id);

  const newBoxRef = db.collection(COLLECTIONS.boxes).doc(newBox.id);

  await newBoxRef.update({
    fileIds: [...newBox.fileIds, ...existingBoxData.fileIds.map((id) => id)],
  });

  await updateBoxSize(newBox.id);

  if (action === CreateNewBoxForAnotherUserActions.share) {
    await setBoxToUser(newBoxRef.id, sharedUserData.id);
  }

  if (action === CreateNewBoxForAnotherUserActions.transfer) {
    await deleteBoxIdFromUser(existingBoxRef.id, userId);
    await existingBoxRef.delete();
  }
};
