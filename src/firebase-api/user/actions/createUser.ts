import { db } from "config/firebase";
import { COLLECTIONS } from "enums";
import { User } from "custom-types/User";

export default async function createUser(user: User, uid: string) {
  try {
    await db.collection(COLLECTIONS.users).doc(uid).set(user);
  } catch (error) {
    throw new Error(`Something went wrong with creating user. Error: ${error}`);
  }
}
