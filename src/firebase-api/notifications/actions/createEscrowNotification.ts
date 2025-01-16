import { db } from "config/firebase";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { NOTIFICATION_TYPES, ESCROW_STATUSES, COLLECTIONS } from "enums";
import { EscrowNotification } from "custom-types/Notification";

type CreateNotificationData = {
  fromUserId: string;
  toUserId: string;
  escrowId: string;
  escrowName: string;
  escrowStatus: ESCROW_STATUSES;
};

export default async function createEscrowNotification({
  fromUserId,
  toUserId,
  escrowId,
  escrowName,
  escrowStatus,
}: CreateNotificationData): Promise<EscrowNotification & { id: string }> {
  try {
    const newNotification = {
      type: NOTIFICATION_TYPES.escrow,
      createdAt: FieldValue.serverTimestamp() as Timestamp,
      isViewed: false,
      userFrom: {
        id: fromUserId,
      },
      userTo: {
        id: toUserId,
      },
      escrowData: {
        id: escrowId,
        name: escrowName,
        status: escrowStatus,
      },
    } as EscrowNotification;

    const docRef = await db
      .collection(COLLECTIONS.notifications)
      .add(newNotification);
    const notificationId = docRef.id;

    return { id: notificationId, ...newNotification };
  } catch (error) {
    throw new Error(
      `Something went wrong with creating escrow notification. Error: ${error}`
    );
  }
}
