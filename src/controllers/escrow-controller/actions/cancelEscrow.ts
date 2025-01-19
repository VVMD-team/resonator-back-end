import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import {
  checkIsCounterparty,
  checkIsOwner,
  cancelEscrowByCounterparty,
  cancelEscrowByOwner,
} from "firebase-api/escrow";

import createAndSendEscrowNotificationsToParticipants from "utils/escrow/createAndSendEscrowNotificationsToParticipants";

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

    let status;

    const [isCounterparty, escrow] = await checkIsCounterparty(
      userId,
      escrowId
    );
    if (isCounterparty) {
      status = await cancelEscrowByCounterparty({
        counterpartyId: userId,
        escrowId,
      });
    }

    const [isOwner] = await checkIsOwner(userId, escrowId);
    if (isOwner) {
      status = await cancelEscrowByOwner({ ownerId: userId, escrowId });
    }

    if (status) {
      await createAndSendEscrowNotificationsToParticipants({
        ownerId: escrow.ownerId,
        counterpartyAddress: escrow.counterpartyAddress,
        escrowId: escrow.id,
        escrowName: escrow.name,
        escrowStatus: status,
      });

      return res.status(200).send({ status });
    }

    return res
      .status(405)
      .send({ message: "You are not allowed to cancel this escrow" });
  } catch (error) {
    next(error);
  }
}
