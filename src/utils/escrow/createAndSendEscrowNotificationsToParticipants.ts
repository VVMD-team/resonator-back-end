import { createEscrowNotification } from "firebase-api/notifications";
import sendNotification from "utils/notifications/sendNotification";
import { mapNotificationToDTO } from "utils/notifications/mappers";

import { ESCROW_STATUSES } from "enums/index";

type CreateAndSendEscrowNotificationsToParticipantsData = {
  ownerId: string;
  counterpartyAddress: string;
  escrowId: string;
  escrowName: string;
  escrowStatus: ESCROW_STATUSES;
};

export default async function createAndSendEscrowNotificationsToParticipants({
  ownerId,
  counterpartyAddress,
  escrowId,
  escrowName,
  escrowStatus,
}: CreateAndSendEscrowNotificationsToParticipantsData) {
  const base = {
    escrowId,
    escrowName,
    escrowStatus,
  };

  const notificationToCounterparty = await createEscrowNotification({
    toUserId: counterpartyAddress,
    ...base,
  });

  const notificationToOwner = await createEscrowNotification({
    toUserId: ownerId,
    ...base,
  });

  sendNotification(
    counterpartyAddress,
    mapNotificationToDTO(notificationToCounterparty)
  );
  sendNotification(escrowId, mapNotificationToDTO(notificationToOwner));
}
