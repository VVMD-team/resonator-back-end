import { db } from "config/firebase";

import { COLLECTIONS } from "enums";

export default async function updateNotificationViewedById(
  notificationId: string
) {
  try {
    const docRef = db.collection(COLLECTIONS.notifications).doc(notificationId);

    return await docRef.update({ isViewed: true });
  } catch (error) {
    throw new Error(
      `Something went wrong with creating escrow notification. Error: ${error}`
    );
  }
}
