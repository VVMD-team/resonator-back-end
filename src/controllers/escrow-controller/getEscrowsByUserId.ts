import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";
import { getEscrowsByUserId as getEscrowsByUserIdFromDB } from "firebase-api/escrow";

export default async function getEscrowsByUserId(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId as string;

    const escrows = await getEscrowsByUserIdFromDB(userId);

    return res.status(200).send({ data: escrows, total: escrows.length });
  } catch (error) {
    next(error);
  }
}
