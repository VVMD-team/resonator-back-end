import {
  NotificationDTO,
  Notification,
  EscrowNotification,
} from "custom-types/Notification";
import { NOTIFICATION_TYPES, ESCROW_STATUSES } from "enums";

export default function mapNotificationToDTO(
  notification: Notification & { id: string }
): NotificationDTO {
  const basic = {
    id: notification.id,
    type: notification.type,
    createdAt: notification.createdAt,
    isViewed: notification.isViewed,
  };

  switch (notification.type) {
    case NOTIFICATION_TYPES.escrow:
      const escrowNotification = notification as EscrowNotification;

      const { id: escrowId, name, status } = escrowNotification.escrowData;

      const message = (() => {
        if (status === ESCROW_STATUSES.in_progress) {
          return `"${name}" new escrow`;
        }
        if (
          status === ESCROW_STATUSES.canceled_by_counterparty ||
          status === ESCROW_STATUSES.canceled_by_owner
        ) {
          return `"${name}" was cancelled`;
        }
        if (status === ESCROW_STATUSES.completed) {
          return `"${name}" is completed successfully`;
        }

        return "";
      })();

      return {
        ...basic,
        linkId: escrowId,
        message,
      };
    default:
      throw new Error("Invalid notification type");
  }
}
