import { db } from "config/firebase";

import { COLLECTIONS } from "enums";

import { Box } from "custom-types/Box";

export default async function checkIsUsersBox(boxId: string, userId: string) {
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
}
