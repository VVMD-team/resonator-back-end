import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { calculateTotalSize, getUserById } from "firebase-api/user";
import { getFiles } from "firebase-api/file";

export default async function getUserData(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const userId = req.userId as string;

  try {
    if (!userId) {
      console.error(`getUserData: User id ${userId} not found`);
      return res.status(500).send({ message: "Internal Server Error" });
    }

    const user = await getUserById(userId);
    const totalSize = await calculateTotalSize(userId);
    const files = await getFiles(userId);

    return res
      .status(200)
      .send({ ...user, totalSize, numberOfFiles: files?.length || 0 });
  } catch (error) {
    next(error);
  }
}
