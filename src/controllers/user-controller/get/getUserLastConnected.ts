import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { getUserByPublicKey } from "firebase-api/user";

export default async function getUserLastConnected(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { public_key } = req.query as { public_key?: string };

    if (!public_key) {
      return res.status(400).send({ message: "Public key is required" });
    }

    const user = await getUserByPublicKey(public_key);

    return res
      .status(200)
      .send({ lastConnectedAt: user.lastConnectedAt || user.createdAt });
  } catch (error) {
    next(error);
  }
}
