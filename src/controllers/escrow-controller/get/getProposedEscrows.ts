import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";
import { getCounterpartyActiveEscrows } from "firebase-api/escrow";

export default async function getProposedEscrows(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId as string;

    const escrows = await getCounterpartyActiveEscrows(userId);

    return res.status(200).send({ escrows });
  } catch (error) {
    next(error);
  }
}
