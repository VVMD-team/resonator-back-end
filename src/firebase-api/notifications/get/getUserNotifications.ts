import { db } from "config/firebase";
import { COLLECTIONS } from "enums";

import { mapNotificationDoc } from "./helpers";

export default async function getUserNotifications(userId: string) {
  try {
    const notificationsRef = db.collection(COLLECTIONS.notifications);

    const query1 = notificationsRef.where("userTo.id", "==", userId).get();

    const query2 = notificationsRef.where("userFrom.id", "==", userId).get();

    const [snapshot1, snapshot2] = await Promise.all([query1, query2]);

    if (snapshot1.empty && snapshot2.empty) {
      console.log(`getNotifications: ${userId}, snapshot empty`);
      return [];
    }

    const notifications = [
      ...snapshot1.docs.map(mapNotificationDoc),
      ...snapshot2.docs.map(mapNotificationDoc),
    ];

    const sortedNotifications = notifications.sort(
      (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()
    );

    return sortedNotifications;
  } catch (error) {
    console.error("Error getting notifications by user id:", error);
    throw new Error("Could not retrieve notifications");
  }
}
