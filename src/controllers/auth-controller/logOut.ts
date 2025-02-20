import { auth, signOut } from "config/firebase";

import { authCookieOptions } from "const";
import { Request, Response, NextFunction } from "express";

export default async function logOut(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await signOut(auth);
    res.clearCookie("custom_token", authCookieOptions);
    res.status(200).send({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
}
