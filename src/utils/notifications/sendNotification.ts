import { NotificationDTO } from "custom-types/Notification";
import { WS_DATA_TYPES } from "enums/index";

import { sendMessageToUser } from "websocket-server";

export default async function sendNotification(
  userId: string,
  notificationDTO: NotificationDTO
) {
  const notificationWithWSDataType = {
    ...notificationDTO,
    wsDataType: WS_DATA_TYPES.escrow_notification,
  };

  sendMessageToUser({
    userId,
    message: JSON.stringify(notificationWithWSDataType),
  });
}
