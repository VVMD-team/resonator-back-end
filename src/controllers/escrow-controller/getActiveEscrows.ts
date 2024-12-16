import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";
import { getUserEscrowsByStatus as getUserEscrowsByStatusFromDB } from "firebase-api/escrow";

import { ESCROW_STATUSES } from "enums";

export default async function getActiveEscrows(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId as string;

    const escrows = await getUserEscrowsByStatusFromDB(
      userId,
      ESCROW_STATUSES.in_progress
    );

    return res.status(200).send({ data: escrows, total: escrows.length });
  } catch (error) {
    next(error);
  }
}
