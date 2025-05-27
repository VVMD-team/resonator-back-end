import { db } from "config/firebase";
import { COLLECTIONS } from "enums";

import { Timestamp } from "firebase-admin/firestore";

type Params = {
  userId: string;
  lastConnectedAt: Timestamp;
};

export default async function updateUserLastConnected({
  userId,
  lastConnectedAt,
}: Params) {
  const userRef = db.collection(COLLECTIONS.users).doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    throw new Error(`User with ID ${userId} not found`);
  }

  await userRef.update({ lastConnectedAt });
}
