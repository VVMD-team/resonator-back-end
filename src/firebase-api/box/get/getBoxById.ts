import { db } from "config/firebase";

import { COLLECTIONS } from "enums";

import { Box } from "custom-types/Box";

export default async function getBoxById(boxId: string) {
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
}
