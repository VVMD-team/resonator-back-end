import { db } from "config/firebase";

import { COLLECTIONS } from "enums";

import { getDefaultBoxes } from "helpers/get-default-boxes";

export default async function createDefaultBoxes(userId: string) {
  try {
    const defaultBoxes = getDefaultBoxes(userId);
    const collectionRef = db.collection(COLLECTIONS.boxes);
    const userRef = db.collection(COLLECTIONS.users).doc(userId);

    const promises = defaultBoxes.map(async (item) => {
      const docRef = await collectionRef.add(item);
      return docRef.id;
    });

    const boxIds = await Promise.all(promises);

    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error("Can't find this user");
    }

    const userData = userDoc.data();
    const existingBoxIds = userData?.boxIds || [];

    await userRef.update({
      boxIds: [...existingBoxIds, ...boxIds],
    });
  } catch (error) {
    throw new Error(
      `Something went wrong with creating custom boxes. Error: ${error}`
    );
  }
}
