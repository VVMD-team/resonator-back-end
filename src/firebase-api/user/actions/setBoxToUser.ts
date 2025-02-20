import { db } from "config/firebase";
import { COLLECTIONS } from "enums";

export default async function setBoxToUser(boxId: string, userId: string) {
  try {
    const userDoc = await db.collection(COLLECTIONS.users).doc(userId).get();
    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data();

    const updatedBoxIds = [...(userData?.boxIds || []), boxId].filter(
      (id, index, arr) => arr.indexOf(id) === index
    );

    await db
      .collection(COLLECTIONS.users)
      .doc(userId)
      .update({ boxIds: updatedBoxIds });

    return { ...userData, boxIds: updatedBoxIds };
  } catch (error) {
    throw new Error(`Failed to add box to user. Error: ${error}`);
  }
}
