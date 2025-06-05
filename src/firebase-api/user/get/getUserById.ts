import { db } from "config/firebase";
import { COLLECTIONS } from "enums";
import { User } from "custom-types/User";

export default async function getUserById(
  id: string
): Promise<(User & { id: string }) | null> {
  try {
    const userDoc = await db.collection(COLLECTIONS.users).doc(id).get();
    if (userDoc.exists) {
      const userData = userDoc.data() as User;
      return { ...userData, id: userDoc.id };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user by ID:", error);
    throw new Error(`Something went wrong with getting user. Error: ${error}`);
  }
}
