import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { getEscrowById } from "firebase-api/escrow";

export default async function getSingleEscrow(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const escrowId = req.params.id;

    if (!escrowId) {
      return res.status(400).send({ message: "Escrow ID is required" });
    }

    const escrow = await getEscrowById(escrowId);

    if (!escrow) {
      return res.status(404).send({ message: "Escrow not found" });
    }

    return res.status(200).send({ escrow });
  } catch (error) {
    next(error);
  }
}
