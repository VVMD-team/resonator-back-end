import { Router } from "express";

import * as AuthController from "controllers/auth-controller";
import * as FilesController from "controllers/files-controller";
import * as UserController from "controllers/user-controller";
import * as BoxesController from "controllers/boxes-controller";
import * as EscrowController from "controllers/escrow-controller";
import * as NotificationController from "controllers/notification-controller";
import * as ChatController from "controllers/chat-controller";

import verifyToken from "middleware/verifyToken";
import asyncHandler from "utils/asyncHandler";

import { upload } from "config/multerConfig";

const router = Router();

// =====================================================================
// Files

router.post(
  "/upload-file",
  asyncHandler(verifyToken),
  upload.single("file"),
  asyncHandler(FilesController.uploadFile)
);

router.post(
  "/decrypt-file-old",
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
const userEndpoint = "/user";

router.get(
  userEndpoint,
  asyncHandler(verifyToken),
  asyncHandler(UserController.getUserData)
);

router.get(
  `${userEndpoint}/custom-pub-key`,
  asyncHandler(verifyToken),
  asyncHandler(UserController.getUserCustomPubKey)
);

router.get(
  `${userEndpoint}/last-connected`,
  asyncHandler(verifyToken),
  asyncHandler(UserController.getUserLastConnected)
);

router.post(
  `${userEndpoint}/add-custom-key-pair`,
  asyncHandler(verifyToken),
  asyncHandler(UserController.addCustomKeyPair)
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

router.get(
  "/files/file-encrypted-data",
  asyncHandler(verifyToken),
  asyncHandler(FilesController.getFileEncryptedData)
);

router.delete(
  "/files/delete",
  asyncHandler(verifyToken),
  asyncHandler(FilesController.deleteFile)
);

router.delete(
  "/files/remove-owner",
  asyncHandler(verifyToken),
  asyncHandler(FilesController.removeFileOwner)
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
  upload.single("file"),
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
  upload.single("file"),
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

// =====================================================================
// Chat

const chatEndpoint = "/chat";

// Conversations
const conversationsEndpoint = `${chatEndpoint}/conversations`;

router.post(
  `${conversationsEndpoint}/create`,
  asyncHandler(verifyToken),
  asyncHandler(ChatController.createConversation)
);

router.get(
  `${conversationsEndpoint}/all`,
  asyncHandler(verifyToken),
  asyncHandler(ChatController.getConversations)
);

router.get(
  `${conversationsEndpoint}/single`,
  asyncHandler(verifyToken),
  asyncHandler(ChatController.getConversationByID)
);

// Messages
const messagesEndpoint = `${chatEndpoint}/messages`;

router.post(
  `${messagesEndpoint}/create`,
  asyncHandler(verifyToken),
  asyncHandler(ChatController.createMessage)
);

router.get(
  `${messagesEndpoint}/all`,
  asyncHandler(verifyToken),
  asyncHandler(ChatController.getMessages)
);

export default router;
