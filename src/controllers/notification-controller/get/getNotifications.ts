import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { getUserNotifications } from "firebase-api/notifications";

import { mapNotificationToDTO } from "utils/notifications/mappers";

export default async function getNotifications(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId as string;

    const notifications = await getUserNotifications(userId);

    const notificationsDTO = notifications.map(mapNotificationToDTO);

    return res.status(200).send({ notifications: notificationsDTO });
  } catch (error) {
    next(error);
  }
}
