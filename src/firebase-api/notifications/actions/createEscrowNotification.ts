import { db } from "config/firebase";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { NOTIFICATION_TYPES, ESCROW_STATUSES, COLLECTIONS } from "enums";
import { EscrowNotification, Notification } from "custom-types/Notification";

type CreateNotificationData = {
  toUserId: string;
  escrowId: string;
  escrowName: string;
  escrowStatus: ESCROW_STATUSES;
  fromUserId?: string;
};

export default async function createEscrowNotification({
  toUserId,
  escrowId,
  escrowName,
  escrowStatus,
  fromUserId,
}: CreateNotificationData): Promise<EscrowNotification & { id: string }> {
  try {
    const newNotification = {
      type: NOTIFICATION_TYPES.escrow,
      createdAt: FieldValue.serverTimestamp() as Timestamp,
      isViewed: false,
      ...(fromUserId && {
        userFrom: {
          id: fromUserId,
        },
      }),
      userTo: {
        id: toUserId,
      },
      escrowData: {
        id: escrowId,
        name: escrowName,
        status: escrowStatus,
      },
    } as EscrowNotification;

    const notificationRef = await db
      .collection(COLLECTIONS.notifications)
      .add(newNotification);

    const snapshot = await notificationRef.get();

    const notificationData = snapshot.data() as Notification;

    return { id: notificationRef.id, ...notificationData };
  } catch (error) {
    throw new Error(
      `Something went wrong with creating escrow notification. Error: ${error}`
    );
  }
}
