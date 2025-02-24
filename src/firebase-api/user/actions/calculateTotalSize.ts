import { db } from "config/firebase";
import { COLLECTIONS } from "enums";

export default async function calculateTotalSize(userId: string) {
  try {
    const userDoc = await db.collection(COLLECTIONS.users).doc(userId).get();

    if (!userDoc.exists) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const userData = userDoc.data();
    const boxIds = userData?.boxIds || [];

    if (boxIds.length === 0) {
      return 0;
    }

    const boxDocs = await Promise.all(
      boxIds.map((boxId: string) =>
        db.collection(COLLECTIONS.boxes).doc(boxId).get()
      )
    );

    const totalSize = boxDocs.reduce((sum, boxDoc) => {
      if (boxDoc.exists) {
        const boxData = boxDoc.data();
        return sum + (boxData.size || 0);
      }
      return sum;
    }, 0);

    return totalSize;
  } catch (error) {
    throw new Error(
      `Something went wrong with calculating total size. Error: ${error}`
    );
  }
}
