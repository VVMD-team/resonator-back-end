import { Timestamp } from "firebase-admin/firestore";

import { NOTIFICATION_TYPES, ESCROW_STATUSES } from "enums";

type NotificationUserData = {
  id: string;
};

type NotificationBase = {
  type: NOTIFICATION_TYPES;
  createdAt: Timestamp;
  userFrom: NotificationUserData;
  userTo: NotificationUserData;
  isViewed: boolean;
};

export type EscrowNotification = NotificationBase & {
  escrowData: {
    id: string;
    name: string;
    status: ESCROW_STATUSES;
  };
};

export type Notification = EscrowNotification;
