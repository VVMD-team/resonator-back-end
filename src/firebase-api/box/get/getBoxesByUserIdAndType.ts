import { db } from "config/firebase";

import { BOX_TYPES, COLLECTIONS } from "enums";

import { Box } from "custom-types/Box";

export default async function getBoxesByUserIdAndType(
  userId: string,
  type: BOX_TYPES
) {
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
}
