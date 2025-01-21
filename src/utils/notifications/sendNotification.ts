import { NotificationDTO } from "custom-types/Notification";

import { sendMessageToUser } from "websocket-server";

export default async function sendNotification(
  userId: string,
  notificationDTO: NotificationDTO
) {
  const notificationString = JSON.stringify(notificationDTO);

  sendMessageToUser({ userId, message: notificationString });
}
