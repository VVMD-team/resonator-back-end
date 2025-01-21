import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { getEscrowHistory } from "firebase-api/escrow";

import { mapEscrowToDTOShort } from "utils/escrow/mappers";

export default async function getHistory(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId as string;

    const escrows = await getEscrowHistory(userId);

    const escrowsDTO = escrows.map(mapEscrowToDTOShort);

    return res.status(200).send({ escrows: escrowsDTO });
  } catch (error) {
    next(error);
  }
}
