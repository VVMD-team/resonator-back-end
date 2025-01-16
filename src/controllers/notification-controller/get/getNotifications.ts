import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { getUserNotifications } from "firebase-api/notifications";

export default async function getNotifications(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId as string;

    const notifications = await getUserNotifications(userId);

    return res.status(200).send({ notifications });
  } catch (error) {
    next(error);
  }
}
