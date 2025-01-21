import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { updateNotificationViewedById } from "firebase-api/notifications";

export default async function viewNotification(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { notificationId } = req.body;

    if (!notificationId) {
      return res.status(400).send({ message: "Notification id is required" });
    }

    await updateNotificationViewedById(notificationId);

    return res.status(200).send({ result: true });
  } catch (error) {
    next(error);
  }
}
