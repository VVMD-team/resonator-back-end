import { db } from "config/firebase";
import { COLLECTIONS } from "enums";
import { User } from "custom-types/User";

export default async function getUserByPublicKey(publicKey: string) {
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
    const user = userDoc.data();
    return { ...user, id: userDoc.id } as User & { id: string };
  } catch (error) {
    throw new Error(`${error}`);
  }
}
