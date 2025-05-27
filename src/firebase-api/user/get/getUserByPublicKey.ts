import { db } from "config/firebase";
import { COLLECTIONS } from "enums";
import { User } from "custom-types/User";

export default async function getUserByPublicKey(
  publicKey: string
): Promise<User & { id: string }> {
  try {
    const userQuery = await db
      .collection(COLLECTIONS.users)
      .where("wallet.publicKey", "==", publicKey.toLowerCase())
      .get();

    if (userQuery.empty) {
      console.error("Can not find user by wallet.publicKey: ", publicKey);
      throw new Error("User with this wallet adress does not exist");
    }

    const userDoc = userQuery.docs[0];
    const user = userDoc.data() as User;
    return { ...user, id: userDoc.id };
  } catch (error) {
    throw new Error(`${error}`);
  }
}
