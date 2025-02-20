import { db } from "config/firebase";

import { COLLECTIONS } from "enums";

import { Box } from "custom-types/Box";

export default async function getBoxesByUserId(userId: string): Promise<Box[]> {
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
}
