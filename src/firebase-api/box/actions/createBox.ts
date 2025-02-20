import { db } from "config/firebase";

import { BOX_TYPES, COLLECTIONS } from "enums";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { Box } from "custom-types/Box";

import generateMockTransactionHash from "helpers/generateMockTransactionHash";

export default async function createBox(boxName: string, userId: string) {
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
}
