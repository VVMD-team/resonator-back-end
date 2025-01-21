import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import {
  checkIsCounterparty,
  checkIsOwner,
  updateEscrowById,
  getEscrowById,
} from "firebase-api/escrow";

import { ESCROW_STATUSES } from "enums/index";

export default async function expireEscrow(
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

    const [isOwner, escrow] = await checkIsOwner(userId, escrowId);
    const [isCounterparty] = await checkIsCounterparty(userId, escrowId);

    if (!isOwner && !isCounterparty) {
      return res
        .status(405)
        .send({ message: "You are not allowed to expire this escrow" });
    }

    if (escrow.status !== ESCROW_STATUSES.in_progress) {
      return res
        .status(405)
        .send({ message: "You can expire only in_progress escrow" });
    }

    const expiredStatus = ESCROW_STATUSES.expired;

    await updateEscrowById({ escrowId, status: expiredStatus });

    return res.status(200).send({ expiredStatus });
  } catch (error) {
    next(error);
  }
}
