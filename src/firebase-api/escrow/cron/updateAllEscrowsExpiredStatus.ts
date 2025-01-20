import { db } from "config/firebase";

import { Escrow } from "custom-types/Escrow";
import { ESCROW_STATUSES, COLLECTIONS } from "enums";

import { Timestamp } from "firebase-admin/firestore";

import { ESCROW_SECONDS_TILL_EXPIRATION } from "const";

export default async function updateAllEscrowsExpiredStatus() {
  try {
    const escrowsRef = db.collection(COLLECTIONS.escrows);
    const snapshot = await escrowsRef
      .where("status", "==", ESCROW_STATUSES.in_progress)
      .get();

    if (snapshot.empty) {
      console.log(
        "updateAllEscrowsExpiredStatus: No non-expired escrows found."
      );
      return;
    }

    const batch = db.batch();
    const now = Timestamp.now();

    const updatedEscrowIds: string[] = [];

    snapshot.forEach((doc) => {
      const escrowData = doc.data() as Escrow;

      if (
        escrowData.status !== ESCROW_STATUSES.expired &&
        escrowData.createdAt instanceof Timestamp
      ) {
        const createdAtSeconds = escrowData.createdAt.seconds;
        const expiredThreshold =
          createdAtSeconds + ESCROW_SECONDS_TILL_EXPIRATION;

        if (now.seconds >= expiredThreshold) {
          const escrowRef = escrowsRef.doc(doc.id);
          batch.update(escrowRef, { status: ESCROW_STATUSES.expired });

          updatedEscrowIds.push(doc.id);
        }
      }
    });

    await batch.commit();

    console.log(
      `Updated status to expired for ${
        updatedEscrowIds.length
      } escrows: ${updatedEscrowIds.toString()}`
    );
  } catch (error) {
    console.error("updateAllEscrowsExpiredStatus error: ", error);
    throw new Error("updateAllEscrowsExpiredStatus error");
  }
}
