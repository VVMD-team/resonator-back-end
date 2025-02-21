import { BOX_TYPES, COLLECTIONS } from "enums";
import { getUserById, getUserByPublicKey } from "./user";
import { db } from "config/firebase";
import { File } from "custom-types/File";
import { Box } from "custom-types/Box";

import { updateBoxSize } from "./box";
import {
  deleteFileFromStorage,
  uploadFileToStorage,
} from "firebase-storage/file";

import { ESCROW_FILE_STATUSES } from "enums";

export const setFiles = async (files: File[]) => {
  const collectionRef = db.collection(COLLECTIONS.files);
  try {
    const addedFiles = await Promise.all(
      files.map(async (file: File) => {
        const docRef = await collectionRef.add(file);
        return { ...file, id: docRef.id };
      })
    );

    return addedFiles;
  } catch (error) {
    throw new Error(`Something went wrong with adding file. Error: ${error}`);
  }
};

export const checkIsUsersFile = async (fileId: string, userId: string) => {
  const fileDoc = await db.collection(COLLECTIONS.files).doc(fileId).get();
  if (fileDoc.exists) {
    const fileData = fileDoc.data() as File;
    return fileData.ownerIds.includes(userId);
  } else {
    return false;
  }
};

export const setFileIdToBox = async (boxId: string, fileIds: string[]) => {
  const boxDoc = await db.collection(COLLECTIONS.boxes).doc(boxId).get();
  if (!boxDoc.exists) {
    throw new Error(`Box with ID ${boxId} does not exist.`);
  }

  const boxData = boxDoc.data();

  const updatedFileIds = [...(boxData?.fileIds || []), ...fileIds].filter(
    (id, index, arr) => arr.indexOf(id) === index
  );

  await db
    .collection(COLLECTIONS.boxes)
    .doc(boxId)
    .update({ fileIds: updatedFileIds });
};

export const getFiles = async (userId: string) => {
  try {
    const filesSnapshot = await db
      .collection("files")
      .where("ownerIds", "array-contains", userId)
      .get();

    if (filesSnapshot.empty) {
      return [];
    }

    const files = filesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as File),
    }));

    return files;
  } catch (error) {
    throw new Error(
      `Something went wrong with getting all files.  Error: ${error}`
    );
  }
};

export const getFileById = async (fileId: string) => {
  try {
    const fileDoc = await db.collection(COLLECTIONS.files).doc(fileId).get();
    if (fileDoc.exists) {
      const fileData = fileDoc.data() as File;

      const fileId = fileDoc?.id;

      return { ...fileData, id: fileId };
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(`Something went wrong with getting file. Error: ${error}`);
  }
};

export const getFileByContractFileId = async (fileContractId: string) => {
  try {
    const fileQuery = await db
      .collection(COLLECTIONS.files)
      .where("fileContractId", "==", fileContractId)
      .get();

    if (fileQuery.empty) {
      console.error("Can not find file by fileContractId: ", fileContractId);
      throw new Error("Can not find file by fileContractId");
    }

    const fileDoc = fileQuery.docs[0];
    const fileData = fileDoc.data() as File;

    return { ...fileData, id: fileDoc.id };
  } catch (error) {
    throw new Error(`Something went wrong with getting file. Error: ${error}`);
  }
};

export const deleteFileById = async (fileId: string, userId: string) => {
  try {
    const fileRef = db.collection(COLLECTIONS.files).doc(fileId);
    const fileDoc = await fileRef.get();

    if (!fileDoc.exists) {
      throw new Error("File does not exist.");
    }

    const file = fileDoc.data() as File;

    if (
      !file.ownerIds.includes(userId) ||
      file.escrowFileStatus === ESCROW_FILE_STATUSES.on_sell
    ) {
      throw new Error("Cannot delete file.");
    }

    if (file.ownerIds.length === 1) {
      await fileRef.delete();
      await deleteFileFromStorage(file.filePath);
    } else {
      const updatedOwnerIds = file.ownerIds.filter((id) => id !== userId);
      await fileRef.update({ ownerIds: updatedOwnerIds });
    }

    const boxesSnapshot = await db
      .collection(COLLECTIONS.boxes)
      .where("fileIds", "array-contains", fileId)
      .get();

    if (!boxesSnapshot.empty) {
      const batch = db.batch();
      boxesSnapshot.forEach((boxDoc) => {
        const updatedFileIds = boxDoc
          .data()
          .fileIds.filter((id: string) => id !== fileId);
        batch.update(boxDoc.ref, { fileIds: updatedFileIds });
      });
      await batch.commit();
    }
  } catch (error) {
    throw new Error(`Something went wrong with deleting file. Error: ${error}`);
  }
};

export const getLastUploaded = async (userId: string) => {
  const filesSnapshot = await db
    .collection("files")
    .where("ownerIds", "array-contains", userId)
    .orderBy("createdAt", "desc")
    .limit(4)
    .get();

  if (filesSnapshot.empty) {
    return [];
  }

  const files = filesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as File),
  }));

  return files;
};

const updateFileById = async (fileId: string, data: any) => {
  try {
    await db.collection(COLLECTIONS.files).doc(fileId).update(data);
  } catch (error) {
    throw new Error(`Something went wrong with updating file. Error: ${error}`);
  }
};

export const shareFileToAnotherUser = async (
  walletPublicKey: string,
  fileId: string,
  fileBuffer?: Buffer,
  sharedKey?: string
) => {
  const sharedUserData = await getUserByPublicKey(walletPublicKey);

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

  if (!sharedKey && !existedFile?.sharedKey) {
    throw new Error("Shared key is required");
  }

  if (sharedKey && !fileBuffer) {
    throw new Error("File is required");
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

  if (fileBuffer) {
    await uploadFileToStorage(
      fileBuffer,
      existedFile.name,
      existedFile.mimetype,
      existedFile.filePath
    );
  }

  await updateFileById(existedFile.id, {
    name: existedFile.name,
    size: existedFile.size,
    mimetype: existedFile.mimetype,
    createdAt: existedFile.createdAt,
    fileTransactionHash: existedFile.fileTransactionHash,
    ownerIds: [...existedFile.ownerIds, sharedUserData.id],
    ...(sharedKey && { sharedKey }),
  });

  await db
    .collection(COLLECTIONS.boxes)
    .doc(sharedBoxId)
    .update({ fileIds: [...sharedBoxFileIds, existedFile.id] });

  await updateBoxSize(sharedBoxId);
};

type TransferFileToAnotherUserData = {
  senderUserId: string;
  recipientWalletPublicKey: string;
  fileId: string;
  transferBoxType?: BOX_TYPES;
  fileBuffer?: Buffer;
  sharedKey?: string;
};

export const transferFileToAnotherUser = async ({
  senderUserId,
  recipientWalletPublicKey,
  fileId,
  transferBoxType = BOX_TYPES.transfered,
  fileBuffer,
  sharedKey,
}: TransferFileToAnotherUserData) => {
  const sharedUserData = await getUserByPublicKey(recipientWalletPublicKey);

  const currentUser = await getUserById(senderUserId);

  if (!currentUser) {
    throw new Error("User not found");
  }

  if (!sharedUserData?.boxIds || !sharedUserData?.boxIds.length) {
    throw new Error("No boxes found for the user");
  }

  const transferedBoxId = await Promise.all(
    sharedUserData.boxIds.map(async (boxId) => {
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

  if (!existedFile.sharedKey) {
    if (sharedKey) {
      if (!fileBuffer) {
        throw new Error("File is required");
      }
    } else {
      throw new Error("Shared key is required");
    }
  }

  const transferedBoxDoc = await db
    .collection(COLLECTIONS.boxes)
    .doc(transferedBoxId)
    .get();
  const transferedBoxData = transferedBoxDoc.data();

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

  if (fileBuffer) {
    await uploadFileToStorage(
      fileBuffer,
      existedFile.name,
      existedFile.mimetype,
      existedFile.filePath
    );
  }

  await updateFileById(existedFile.id, {
    name: existedFile.name,
    size: existedFile.size,
    mimetype: existedFile.mimetype,
    createdAt: existedFile.createdAt,
    fileTransactionHash: existedFile.fileTransactionHash,
    ownerIds: [
      ...existedFile.ownerIds.filter((id) => id !== senderUserId),
      sharedUserData.id,
    ],
    ...(sharedKey && { sharedKey }),
  });

  await db
    .collection(COLLECTIONS.boxes)
    .doc(transferedBoxId)
    .update({ fileIds: [...transferedFileIds, existedFile.id] });

  await updateBoxSize(transferedBoxId);
};

type ChangeFileEscrowStatusProps = {
  fileId: string;
  escrowFileStatus: ESCROW_FILE_STATUSES;
};
export const changeFileEscrowStatus = async ({
  fileId,
  escrowFileStatus,
}: ChangeFileEscrowStatusProps) => {
  const fileRef = db.collection(COLLECTIONS.files).doc(fileId);
  const fileDoc = await fileRef.get();

  if (!fileDoc.exists) {
    throw new Error(`File with id: ${fileId} not exist`);
  }

  await fileRef.update({ escrowFileStatus });
};
