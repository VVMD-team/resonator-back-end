import { db } from "config/firebase";
import { COLLECTIONS } from "enums";

export default async function setEscrowToUser(
  escrowId: string,
  userId: string
) {
  try {
    const userDoc = await db.collection(COLLECTIONS.users).doc(userId).get();
    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data();

    const updatedEscrowIds = [...(userData?.escrowIds || []), escrowId].filter(
      (id, index, arr) => arr.indexOf(id) === index
    );

    await db
      .collection(COLLECTIONS.users)
      .doc(userId)
      .update({ escrowIds: updatedEscrowIds });

    return { ...userData, escrowIds: updatedEscrowIds };
  } catch (error) {
    throw new Error(`Failed to add escrow to user. Error: ${error}`);
  }
}
