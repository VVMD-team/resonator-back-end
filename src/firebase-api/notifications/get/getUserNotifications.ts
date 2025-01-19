import { db } from "config/firebase";
import { COLLECTIONS } from "enums";

import { mapNotificationDoc } from "./helpers";

export default async function getUserNotifications(userId: string) {
  try {
    const notificationsRef = db.collection(COLLECTIONS.notifications);

    const snapshot = await notificationsRef
      .where("userTo.id", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    if (snapshot.empty) {
      console.log(`getNotifications: ${userId}, snapshot empty`);
      return [];
    }

    const notifications = snapshot.docs.map(mapNotificationDoc);

    return notifications;
  } catch (error) {
    console.error("Error getting notifications by user id:", error);
    throw new Error("Could not retrieve notifications");
  }
}
