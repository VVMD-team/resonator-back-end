// src/routes/index.ts
import { Router } from "express";

import AuthController from "../controllers/auth-controller";
import FilesController from "../controllers/files-controller";
import UserController from "../controllers/user-controller";

import verifyToken from "../middleware/verifyToken";
import filesValidator from "../middleware/filesValidator";
import asyncHandler from "../utils/asyncHandler";

import { upload } from "../config/multerConfig";
import BoxesController from "../controllers/boxes-controller";

const router = Router();

// =====================================================================
// Files Upload
router.post(
  "/upload-files",
  asyncHandler(verifyToken),
  upload.any(),
  filesValidator,
  asyncHandler(FilesController.uploadFiles)
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

router.get(
  "/user/balance",
  asyncHandler(verifyToken),
  asyncHandler(UserController.getTokenBalance)
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

export default router;
