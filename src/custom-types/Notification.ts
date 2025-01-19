import { Timestamp } from "firebase-admin/firestore";

import { NOTIFICATION_TYPES, ESCROW_STATUSES } from "enums";

type NotificationUserData = {
  id: string;
};

type NotificationParticipants = {
  userTo: NotificationUserData;
  userFrom?: NotificationUserData;
};

type NotificationBasicData = {
  type: NOTIFICATION_TYPES;
  createdAt: Timestamp;
  isViewed: boolean;
};

type NotificationBase = NotificationParticipants & NotificationBasicData;

export type EscrowNotification = NotificationBase & {
  escrowData: {
    id: string;
    name: string;
    status: ESCROW_STATUSES;
  };
};

export type NotificationDTO = NotificationBasicData & {
  id: string;
  linkId: string;
  message: string;
};

export type Notification = EscrowNotification;
