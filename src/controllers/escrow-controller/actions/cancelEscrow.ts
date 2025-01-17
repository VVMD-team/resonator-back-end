import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import {
  checkIsCounterparty,
  checkIsOwner,
  cancelEscrowByCounterparty,
  cancelEscrowByOwner,
} from "firebase-api/escrow";
import { createEscrowNotification } from "firebase-api/notifications";
import sendNotification from "utils/notifications/sendNotification";
import { mapNotificationToDTO } from "utils/notifications/mappers";

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
      const notification = await createEscrowNotification({
        fromUserId: escrow.ownerId,
        toUserId: escrow.counterpartyAddress,
        escrowId: escrow.id,
        escrowName: escrow.name,
        escrowStatus: status,
      });

      const notificationDTO = mapNotificationToDTO(notification);
      sendNotification(escrow.ownerId, notificationDTO);
      sendNotification(escrow.counterpartyAddress, notificationDTO);

      return res.status(200).send({ status });
    }

    return res
      .status(405)
      .send({ message: "You are not allowed to cancel this escrow" });
  } catch (error) {
    next(error);
  }
}
