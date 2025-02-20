import { db } from "config/firebase";
import { COLLECTIONS } from "enums";
import { User } from "custom-types/User";

type AddCustomKeyPairData = {
  userId: string;
  customPubKey: string;
  customPrivKey: string;
};

export default async function addCustomKeyPair({
  userId,
  customPubKey,
  customPrivKey,
}: AddCustomKeyPairData) {
  try {
    const userRef = db.collection(COLLECTIONS.users).doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const userData = userDoc.data() as User;

    if (userData.customPubKey && userData.customPrivKey) {
      throw new Error("User already has a custom key pair");
    }

    await userRef.update({ customPubKey, customPrivKey });
  } catch (error) {
    throw new Error(
      `Something went wrong with add custom key/pair. Error: ${error}`
    );
  }
}
