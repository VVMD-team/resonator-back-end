import { admin } from "config/firebase";

import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

export default async function checkAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.userId) {
      return res.json({ authenticated: false });
    }

    const user = await admin.auth().getUser(req.userId);

    res.json({ authenticated: true, user });
  } catch (error) {
    next(error);
  }
}
