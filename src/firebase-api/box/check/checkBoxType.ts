import { db } from "config/firebase";

import { COLLECTIONS } from "enums";

export default async function checkBoxType(boxId: string) {
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
}
