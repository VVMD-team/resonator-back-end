import { db, admin } from "config/firebase";

import { BOX_TYPES, COLLECTIONS } from "enums";

export default async function getDefaultBoxIdForUser(userId: string) {
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
}
