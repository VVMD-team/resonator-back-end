import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";
import { getUserInactiveEscrows as getUserInactiveEscrowsFromBD } from "firebase-api/escrow";

export default async function getInactiveEscrows(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId as string;

    const escrows = await getUserInactiveEscrowsFromBD(userId);

    return res.status(200).send({ data: escrows, total: escrows.length });
  } catch (error) {
    next(error);
  }
}
