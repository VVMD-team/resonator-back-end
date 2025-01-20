import cron from "node-cron";

import { updateAllEscrowsExpiredStatus } from "firebase-api/escrow";

export const scheduleCronOperations = () => {
  try {
    // Runs once at the start of every hour, every day.
    cron.schedule("0 * * * *", () => {
      updateAllEscrowsExpiredStatus();
    });

    console.log("Cron operations scheduled");
  } catch (error) {
    console.error("Can't schedule cron operations:", error);
  }
};
