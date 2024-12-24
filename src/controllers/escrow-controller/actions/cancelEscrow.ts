import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import {
  checkIsCounterparty,
  checkIsOwner,
  cancelEscrowByCounterparty,
  cancelEscrowByOwner,
} from "firebase-api/escrow";

export default async function cancelEscrow(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const escrowId = req.body.escrowId;

    if (!escrowId) {
      return res.status(400).send({ message: "Escrow ID is required" });
    }

    if (typeof escrowId !== "string") {
      return res.status(400).send({ message: "Escrow ID must be a string" });
    }

    const userId = req.userId as string;

    const isCounterparty = await checkIsCounterparty(userId, escrowId);

    if (isCounterparty) {
      await cancelEscrowByCounterparty({ counterpartyId: userId, escrowId });

      return res.status(200).send({ result: true });
    }

    const isOwner = await checkIsOwner(userId, escrowId);

    if (isOwner) {
      await cancelEscrowByOwner({ ownerId: userId, escrowId });

      return res.status(200).send({ result: true });
    }
  } catch (error) {
    next(error);
  }
}
