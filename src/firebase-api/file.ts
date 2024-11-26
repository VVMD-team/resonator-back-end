import { BOX_TYPES, COLLECTIONS } from "../enums";
import { getUserById, getUserByPublicKey } from "./user";
import { db } from "../config/firebase";
import { File } from "../custom-types/File";
import { Box } from "../custom-types/Box";
import { admin } from "../config/firebase";

import { updateBoxSize } from "./box";
import {
  deleteFileFromStorage,
  uploadFileToStorage,
} from "../firebase-storage/file";

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

    const files = filesSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...(doc.data() as File),
      }))
      .map((file) => ({ id: file.id, name: file.name }));

    return files;
  } catch (error) {
    throw new Error(
      `Something went wrong with getting all files. Error: ${error}`
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

export const deleteFileById = async (fileId: string, userId: string) => {
  try {
    const fileRef = db.collection(COLLECTIONS.files).doc(fileId);
    const fileDoc = await fileRef.get();

    if (!fileDoc.exists) {
      throw new Error("File does not exist.");
    }

    const file = fileDoc.data() as File;

    if (!file.ownerIds.includes(userId)) {
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
    ...doc.data(),
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

export const transferFileToAnotherUser = async (
  currentUserId: string,
  walletPublicKey: string,
  fileId: string,
  fileBuffer?: Buffer,
  sharedKey?: string
) => {
  const sharedUserData = await getUserByPublicKey(walletPublicKey);

  const currentUser = await getUserById(currentUserId);

  if (!currentUser) {
    throw new Error("User not found");
  }

  if (!sharedUserData?.boxIds || !sharedUserData?.boxIds.length) {
    throw new Error("No boxes found for the user");
  }

  const transferedBoxId = await Promise.all(
    sharedUserData.boxIds.map(async (boxId) => {
      const boxDoc = await db.collection(COLLECTIONS.boxes).doc(boxId).get();
      return boxDoc.exists && boxDoc.data()?.type === BOX_TYPES.transfered
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

  if (!sharedKey && !existedFile?.sharedKey) {
    throw new Error("Shared key is required");
  }

  if (sharedKey && !fileBuffer) {
    throw new Error("File is required");
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
      ...existedFile.ownerIds.filter((id) => id !== currentUserId),
      sharedUserData.id,
    ],
    sharedKey,
  });

  await db
    .collection(COLLECTIONS.boxes)
    .doc(transferedBoxId)
    .update({ fileIds: [...transferedFileIds, existedFile.id] });

  await updateBoxSize(transferedBoxId);
};

export const moveFileToSharedBox = async (userId: string, fileId: string) => {
  try {
    const userRef = db.collection(COLLECTIONS.users).doc(userId);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      throw new Error("User not found");
    }

    const userData = userSnapshot.data();
    if (!userData || !userData.boxIds) {
      throw new Error("User has no boxes");
    }

    const boxIds: string[] = userData.boxIds;
    const boxSnapshots = await db
      .collection(COLLECTIONS.boxes)
      .where(admin.firestore.FieldPath.documentId(), "in", boxIds)
      .where("type", "==", BOX_TYPES.shared)
      .get();

    if (boxSnapshots.empty) {
      throw new Error("No shared box found for user");
    }

    const sharedBoxRef = boxSnapshots.docs[0].ref;
    const sharedBoxData = boxSnapshots.docs[0].data();

    const fileIds: string[] = sharedBoxData.fileIds || [];
    if (!fileIds.includes(fileId)) {
      fileIds.push(fileId);

      await sharedBoxRef.update({ fileIds });
      console.log(`File ${fileId} was added to shared box for user ${userId}`);
    } else {
      console.log(
        `File ${fileId} is already in the shared box for user ${userId}`
      );
    }
  } catch (error) {
    throw new Error("Error adding file to shared box: " + error);
  }
};

export const moveFileToTransferedBox = async (
  userId: string,
  fileId: string
) => {
  try {
    const userRef = db.collection(COLLECTIONS.users).doc(userId);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      throw new Error("User not found");
    }

    const userData = userSnapshot.data();
    if (!userData || !userData.boxIds) {
      throw new Error("User has no boxes");
    }

    const boxIds: string[] = userData.boxIds;

    const currentBoxSnapshots = await db
      .collection("boxes")
      .where(admin.firestore.FieldPath.documentId(), "in", boxIds)
      .where("fileIds", "array-contains", fileId)
      .get();

    if (!currentBoxSnapshots.empty) {
      const currentBoxRef = currentBoxSnapshots.docs[0].ref;
      const currentFileIds: string[] =
        currentBoxSnapshots.docs[0].data().fileIds || [];

      const updatedFileIds = currentFileIds.filter((id) => id !== fileId);
      await currentBoxRef.update({ fileIds: updatedFileIds });
      console.log(
        `File ${fileId} removed from its current box for user ${userId}`
      );
    }

    const transferedBoxSnapshots = await db
      .collection("boxes")
      .where(admin.firestore.FieldPath.documentId(), "in", boxIds)
      .where("type", "==", BOX_TYPES.transfered)
      .get();

    if (transferedBoxSnapshots.empty) {
      throw new Error("No transfered box found for user");
    }

    const transferedBoxRef = transferedBoxSnapshots.docs[0].ref;
    const transferedFileIds: string[] =
      transferedBoxSnapshots.docs[0].data().fileIds || [];

    if (!transferedFileIds.includes(fileId)) {
      transferedFileIds.push(fileId);
      await transferedBoxRef.update({ fileIds: transferedFileIds });
      console.log(
        `File ${fileId} was added to transfered box for user ${userId}`
      );
    } else {
      console.log(
        `File ${fileId} is already in the transfered box for user ${userId}`
      );
    }
  } catch (error) {
    throw new Error("Error moving file to transfered box: " + error);
  }
};
