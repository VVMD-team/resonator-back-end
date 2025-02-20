import { db } from "config/firebase";
import { COLLECTIONS } from "enums";

export default async function deleteBoxIdFromUser(
  boxId: string,
  userId: string
) {
  try {
    const userDoc = await db.collection(COLLECTIONS.users).doc(userId).get();
    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data();
    const updatedBoxIds = (userData?.boxIds || []).filter(
      (id: string) => id !== boxId
    );

    await db
      .collection(COLLECTIONS.users)
      .doc(userId)
      .update({ boxIds: updatedBoxIds });

    return true;
  } catch (error) {
    throw new Error(`Failed to update user box IDs. Error: ${error}`);
  }
}
