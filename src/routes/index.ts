// src/routes/index.ts
import { Router } from "express";

import AuthController from "controllers/auth-controller";
import * as FilesController from "controllers/files-controller";
import * as UserController from "controllers/user-controller";
import BoxesController from "controllers/boxes-controller";
import * as EscrowController from "controllers/escrow-controller";
import * as NotificationController from "controllers/notification-controller";

import verifyToken from "middleware/verifyToken";
import filesValidator from "middleware/filesValidator";
import asyncHandler from "utils/asyncHandler";

import { upload } from "config/multerConfig";

const router = Router();

// =====================================================================
// Files
router.post(
  "/upload-files",
  asyncHandler(verifyToken),
  upload.any(),
  filesValidator,
  asyncHandler(FilesController.uploadFiles)
);

router.post(
  "/encrypt-file",
  asyncHandler(verifyToken),
  upload.single("file"),
  asyncHandler(FilesController.encryptFile)
);

router.post(
  "/decrypt-file",
  asyncHandler(verifyToken),
  upload.any(),
  asyncHandler(FilesController.decryptFile)
);
// =====================================================================
// Auth
router.get(
  "/check-auth",
  asyncHandler(verifyToken),
  asyncHandler(AuthController.checkAuth)
);

router.post("/logout", asyncHandler(AuthController.logOut));

router.post(
  "/auth/wallet",
  upload.none(),
  asyncHandler(AuthController.authWithWallet)
);
// =====================================================================
// User
router.get(
  "/user",
  asyncHandler(verifyToken),
  asyncHandler(UserController.getUserData)
);

// =====================================================================
// Box
router.post(
  "/box/create",
  asyncHandler(verifyToken),
  asyncHandler(BoxesController.createBox)
);

router.post(
  "/box/share",
  asyncHandler(verifyToken),
  upload.any(),
  asyncHandler(BoxesController.shareBox)
);

router.post(
  "/box/transfer",
  asyncHandler(verifyToken),
  upload.any(),
  asyncHandler(BoxesController.transferBox)
);

router.get(
  "/box/get-all-boxes",
  asyncHandler(verifyToken),
  asyncHandler(BoxesController.getAllBoxes)
);

router.delete(
  "/box/delete",
  asyncHandler(verifyToken),
  asyncHandler(BoxesController.deleteBox)
);
router.get(
  "/box",
  asyncHandler(verifyToken),
  asyncHandler(BoxesController.getOneBox)
);

router.get(
  "/box-files",
  asyncHandler(verifyToken),
  asyncHandler(BoxesController.getBoxFiles)
);
// =====================================================================
// Files
router.get(
  "/files/all",
  asyncHandler(verifyToken),
  asyncHandler(FilesController.getAllFiles)
);

router.get(
  "/files/last-uploaded",
  asyncHandler(verifyToken),
  asyncHandler(FilesController.getLastUploaded)
);

router.get(
  "/files/file",
  asyncHandler(verifyToken),
  asyncHandler(FilesController.getFile)
);

router.delete(
  "/files/delete",
  asyncHandler(verifyToken),
  asyncHandler(FilesController.deleteFile)
);

router.post(
  "/files/share",
  asyncHandler(verifyToken),
  upload.single("file"),
  asyncHandler(FilesController.shareFile)
);

router.post(
  "/files/transfer",
  asyncHandler(verifyToken),
  upload.single("file"),
  asyncHandler(FilesController.transferFile)
);
// =====================================================================
// Escrow
router.post(
  "/escrow/create",
  asyncHandler(verifyToken),
  upload.any(),
  asyncHandler(EscrowController.createEscrow)
);

router.post(
  "/escrow/finalise-withdraw-declined-funds",
  asyncHandler(verifyToken),
  asyncHandler(EscrowController.finaliseWithdrawDeclinedFunds)
);

router.post(
  "/escrow/cancel",
  asyncHandler(verifyToken),
  asyncHandler(EscrowController.cancelEscrow)
);

router.post(
  "/escrow/expire",
  asyncHandler(verifyToken),
  asyncHandler(EscrowController.expireEscrow)
);

router.post(
  "/escrow/finalize",
  asyncHandler(verifyToken),
  upload.any(),
  asyncHandler(EscrowController.finalizeEscrow)
);

router.get(
  "/escrow/history",
  asyncHandler(verifyToken),
  asyncHandler(EscrowController.getHistory)
);

router.get(
  "/escrow/active",
  asyncHandler(verifyToken),
  asyncHandler(EscrowController.getActiveEscrows)
);

router.get(
  "/escrow/proposed",
  asyncHandler(verifyToken),
  asyncHandler(EscrowController.getProposedEscrows)
);

router.get(
  "/escrow/single",
  asyncHandler(verifyToken),
  asyncHandler(EscrowController.getSingleEscrow)
);

// =====================================================================
// Notification

router.post(
  "/notifications/view",
  asyncHandler(verifyToken),
  asyncHandler(NotificationController.viewNotification)
);

router.get(
  "/notifications",
  asyncHandler(verifyToken),
  asyncHandler(NotificationController.getNotifications)
);

export default router;
