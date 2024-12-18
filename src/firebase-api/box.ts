import { db } from "../config/firebase";
import { COLLECTIONS } from "../enums";
import { Box } from "../custom-types/Box";
import { getDefaultBoxes } from "../helpers/get-default-boxes";
import generateMockTransactionHash from "../helpers/generateMockTransactionHash";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { BOX_TYPES } from "../enums";
import { deleteFileById } from "./file";
import { getUserByPublicKey } from "./user";
import { File } from "../custom-types/File";
import { admin } from "../config/firebase";
import { setBoxToUser, deleteBoxIdFromUser } from "./user";
import { uploadFileToStorage } from "../firebase-storage/file";

export const createBox = async (boxName: string, userId: string) => {
  try {
    const createdAt = FieldValue.serverTimestamp() as Timestamp;

    const newBox: Box = {
      ownerId: userId,
      boxTransactionHash: generateMockTransactionHash(),
      name: boxName,
      type: BOX_TYPES.custom,
      createdAt,
      fileIds: [],
      size: 0,
    };
    const docRef = await db.collection(COLLECTIONS.boxes).add(newBox);
    const boxId = docRef?.id;

    return { id: boxId, ...newBox };
  } catch (error) {
    throw new Error(`Something went wrong with creating box. Error: ${error}`);
  }
};

export const getBoxesByUserId = async (userId: string): Promise<Box[]> => {
  try {
    const boxesRef = db.collection(COLLECTIONS.boxes);
    const snapshot = await boxesRef.where("ownerId", "==", userId).get();

    if (snapshot.empty) {
      console.log("No matching documents.");
      return [];
    }

    const boxes = snapshot.docs.map((doc) => {
      const box = doc.data() as Box;

      return { ...box, id: doc.id };
    });
    return boxes;
  } catch (error) {
    console.error("Error getting boxes by user id:", error);
    throw new Error("Could not retrieve boxes");
  }
};

export const getBoxesByUserIdAndType = async (
  userId: string,
  type: BOX_TYPES
) => {
  try {
    const boxesRef = db.collection(COLLECTIONS.boxes);
    const snapshot = await boxesRef
      .where("ownerId", "==", userId)
      .where("type", "==", type)
      .get();

    if (snapshot.empty) {
      console.log("No matching documents.");
      return [];
    }

    const boxes = snapshot.docs.map((doc): Box & { id: string } => ({
      id: doc.id,
      ...(doc.data() as Box),
    }));

    return boxes;
  } catch (error) {
    console.error("Error getting boxes by user id:", error);
    throw new Error("Could not retrieve boxes");
  }
};

export const deleteBoxById = async (boxId: string, userId: string) => {
  try {
    const boxRef = db.collection(COLLECTIONS.boxes).doc(boxId);
    const boxDoc = await boxRef.get();

    if (!boxDoc.exists) {
      throw new Error("Box does not exist.");
    }

    const boxData = boxDoc.data() as Box;

    if (boxData.ownerId !== userId) {
      throw new Error("Cannot delete box.");
    }

    const boxFileIds = boxData.fileIds;

    for (const fileId of boxFileIds) {
      await deleteFileById(fileId, userId);
    }

    await db.runTransaction(async (transaction) => {
      transaction.delete(boxRef);
    });

    return true;
  } catch (error) {
    throw new Error(`Something went wrong with deleting box. Error: ${error}`);
  }
};

export const checkBoxType = async (boxId: string) => {
  try {
    const boxDoc = await db.collection(COLLECTIONS.boxes).doc(boxId).get();
    if (boxDoc.exists) {
      const boxData = boxDoc.data();
      return boxData?.type;
    } else {
      return "";
    }
  } catch (error) {
    throw new Error(`Something went wrong with deleting box. Error: ${error}`);
  }
};

export const getBoxById = async (boxId: string) => {
  try {
    const boxDoc = await db.collection(COLLECTIONS.boxes).doc(boxId).get();
    if (boxDoc.exists) {
      const boxData = boxDoc.data() as Box;
      return { ...boxData, id: boxDoc.id };
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(`Something went wrong with getting box. Error: ${error}`);
  }
};

export const createDefaultBoxes = async (userId: string) => {
  try {
    const defaultBoxes = getDefaultBoxes(userId);
    const collectionRef = db.collection(COLLECTIONS.boxes);
    const userRef = db.collection(COLLECTIONS.users).doc(userId);

    const promises = defaultBoxes.map(async (item) => {
      const docRef = await collectionRef.add(item);
      return docRef.id;
    });

    const boxIds = await Promise.all(promises);

    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error("Can't find this user");
    }

    const userData = userDoc.data();
    const existingBoxIds = userData?.boxIds || [];

    await userRef.update({
      boxIds: [...existingBoxIds, ...boxIds],
    });
  } catch (error) {
    throw new Error(
      `Something went wrong with creating custom boxes. Error: ${error}`
    );
  }
};

export const updateBoxSize = async (boxId: string) => {
  try {
    const box = await getBoxById(boxId);

    if (!box?.fileIds || !Array.isArray(box?.fileIds)) {
      throw new Error(
        `Box with ID ${boxId} does not have a valid fileIds array.`
      );
    }

    let totalSize = 0;

    const filePromises = box.fileIds.map(async (fileId) => {
      const fileRef = db.collection(COLLECTIONS.files).doc(fileId);
      const fileDoc = await fileRef.get();

      if (fileDoc.exists) {
        const fileData = fileDoc.data() as File;
        if (fileData?.size) {
          totalSize += fileData.size;
        }
      } else {
        throw new Error(`File with ID ${fileId} does not exist.`);
      }
    });

    await Promise.all(filePromises);

    await db
      .collection(COLLECTIONS.boxes)
      .doc(boxId)
      .update({ size: totalSize });
  } catch (error) {
    throw new Error(
      `Something went wrong with calculating box size. Error: ${error}`
    );
  }
};

export const getFilesByBoxId = async (
  boxId: string,
  userId: string,
  isLong: boolean = false
) => {
  const boxDoc = await db.collection(COLLECTIONS.boxes).doc(boxId).get();

  if (!boxDoc.exists) {
    throw new Error(`Box with ID ${boxId} does not exist.`);
  }

  const { fileIds, ownerId } = boxDoc.data() as Box;

  if (ownerId !== userId || !fileIds || fileIds.length === 0) {
    return [];
  }

  const filePromises = fileIds.map(
    async (fileId) => await db.collection(COLLECTIONS.files).doc(fileId).get()
  );
  const fileDocs = await Promise.all(filePromises);

  const files = fileDocs
    .filter((doc) => doc.exists)
    .map((doc) => {
      const fileData = doc.data() as File;
      return { id: doc.id, ...fileData };
    });

  if (isLong) {
    return files;
  }

  const filesShort = files.map(({ id, name, mimetype, size }) => ({
    id,
    name,
    mimetype,
    size,
  }));

  return filesShort;
};

export const checkIsUsersBox = async (boxId: string, userId: string) => {
  try {
    const boxDoc = await db.collection(COLLECTIONS.boxes).doc(boxId).get();

    if (!boxDoc.exists) {
      console.log(`Box with ID ${boxId} does not exist.`);
      return false;
    }

    const boxData = boxDoc.data() as Box;

    return boxData?.ownerId === userId;
  } catch (error) {
    throw new Error(`Something went wrong with checking box. Error: ${error}`);
  }
};

type RectyptedFile = {
  id: string;
  fileBuffer: Buffer;
  sharedKey: string;
};

type ShareTransferParams = {
  userId: string;
  walletPublicKey: string;
  boxId: string;
  rectyptedFiles: RectyptedFile[];
};

enum CreateNewBoxForAnotherUserActions {
  share = "share",
  transfer = "transfer",
}

const createNewBoxForAnotherUser = async (
  { userId, walletPublicKey, boxId, rectyptedFiles }: ShareTransferParams,
  action: CreateNewBoxForAnotherUserActions
) => {
  const sharedUserData = await getUserByPublicKey(walletPublicKey);

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

  if (rectyptedFiles.length > 0) {
    const filesPromisesSecond = rectyptedFiles.map(
      async ({ id, fileBuffer, sharedKey }) => {
        const fileRef = db.collection(COLLECTIONS.files).doc(id);

        const fileDoc = await fileRef.get();
        const fileData = fileDoc.data() as File;

        await uploadFileToStorage(
          fileBuffer,
          fileData.name,
          fileData.mimetype,
          fileData.filePath
        );

        await fileRef.update({ sharedKey });
      }
    );

    await Promise.all(filesPromisesSecond);
  }

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

export const shareBoxToAnotherUser = async (params: ShareTransferParams) => {
  await createNewBoxForAnotherUser(
    params,
    CreateNewBoxForAnotherUserActions.share
  );
};

export const transferBoxToAnotherUser = async (params: ShareTransferParams) => {
  await createNewBoxForAnotherUser(
    params,
    CreateNewBoxForAnotherUserActions.transfer
  );
};

export const getDefaultBoxIdForUser = async (userId: string) => {
  try {
    const userDoc = await db.collection(COLLECTIONS.users).doc(userId).get();

    if (!userDoc.exists) {
      throw new Error(`User with ID ${userId} does not exist`);
    }

    const userData = userDoc.data();
    const boxIds = userData?.boxIds || [];

    const boxesQuery = await db
      .collection(COLLECTIONS.boxes)
      .where(admin.firestore.FieldPath.documentId(), "in", boxIds)
      .where("type", "==", BOX_TYPES.default)
      .limit(1)
      .get();

    if (boxesQuery.empty) {
      throw new Error("No box with type=BOX_TYPES.default found");
    }

    const boxDoc = boxesQuery.docs[0];
    return boxDoc.id;
  } catch (error) {
    throw new Error(`Error getting default box ID for user with id: ${userId}`);
  }
};

export const getBoxesWithFile = async (fileId: string) => {
  const boxSnapshots = await db
    .collection(COLLECTIONS.boxes)
    .where("fileIds", "array-contains", fileId)
    .get();

  const boxIds: string[] = boxSnapshots.docs.map((doc) => doc.id);
  return boxIds;
};
