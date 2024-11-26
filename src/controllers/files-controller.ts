import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../custom-types/AuthRequest";
import {
  deleteFileById,
  getFileById,
  getFiles,
  getLastUploaded,
  setFileIdToBox,
  setFiles,
  shareFileToAnotherUser,
  transferFileToAnotherUser,
  checkIsUsersFile,
  moveFileToSharedBox,
  moveFileToTransferedBox,
} from "../firebase-api/file";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import generateMockTransactionHash from "../helpers/generateMockTransactionHash";

import { BOX_TYPES } from "../enums";

import {
  updateBoxSize,
  getBoxesByUserIdAndType,
  getDefaultBoxIdForUser,
  getBoxesWithFile,
} from "../firebase-api/box";
import { File } from "../custom-types/File";
import { uploadFileToStorage } from "../firebase-storage/file";

const FilesController = {
  async uploadFiles(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      const userId = req.userId as string;
      const boxId = req.body.boxId || (await getDefaultBoxIdForUser(userId));

      const filesFormattedPromises: Promise<File>[] = files.map(
        async (file, index) => {
          const originalName = req.body.files[index].originalName;
          const mimeType = req.body.files[index].mimeType;

          const { filePath, publicUrl } = await uploadFileToStorage(
            file.buffer,
            originalName,
            mimeType
          );

          return {
            ownerIds: [userId],
            name: originalName,
            size: file.size,
            mimetype: mimeType,
            createdAt: FieldValue.serverTimestamp() as Timestamp,
            filePath,
            publicUrl,
            fileTransactionHash: generateMockTransactionHash(),
          };
        }
      );

      const filesFormatted: File[] = await Promise.all(filesFormattedPromises);

      const addedFiles = await setFiles(filesFormatted);

      const fileIds = addedFiles.map(({ id }) => id);

      if (boxId) {
        await setFileIdToBox(boxId, fileIds);
        await updateBoxSize(boxId);
      } else {
        const defaultBoxes = await getBoxesByUserIdAndType(
          userId,
          BOX_TYPES.default
        );

        if (defaultBoxes.length === 0) {
          console.error(`User do not have default box. userId: ${userId}`);
          throw new Error("User do not have default box.");
        }

        if (defaultBoxes.length > 1) {
          console.error(
            `User has more than one default box. userId: ${userId}`
          );

          throw new Error("User has more than one default box.");
        }

        const { id: defaultBoxId } = defaultBoxes[0];

        await setFileIdToBox(defaultBoxId, fileIds);
        await updateBoxSize(defaultBoxId);
      }

      res.status(200).send({ files: addedFiles });
    } catch (error) {
      next(error);
    }
  },

  async getAllFiles(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId as string;
      const files = await getFiles(userId);

      res.status(200).send({ files });
    } catch (error) {
      next(error);
    }
  },

  async getFile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.query as { id?: string };

      if (!id) {
        return res
          .status(400)
          .send({ file: null, message: "File ID is required" });
      }

      const userId = req.userId as string;

      const file = await getFileById(id);

      if (!file || !file.ownerIds.includes(userId)) {
        res
          .status(400)
          .send({ file: null, message: `File with id: ${id} not found` });
      }

      res.status(200).send({ file });
    } catch (error) {
      next(error);
    }
  },

  async deleteFile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.body;

      if (!fileId) {
        return res
          .status(400)
          .send({ result: false, message: "File ID is required" });
      }

      const userId = req.userId as string;

      const boxesWithCurrentFile = await getBoxesWithFile(fileId);
      await deleteFileById(fileId, userId);

      for (const boxId of boxesWithCurrentFile) {
        await updateBoxSize(boxId);
      }

      res.status(200).send({ result: true });
    } catch (error) {
      next(error);
    }
  },

  async getLastUploaded(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId as string;

      const files = await getLastUploaded(userId);

      res.status(200).send({ files });
    } catch (error) {
      next(error);
    }
  },

  async shareFile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const file = req.file ? (req.file as Express.Multer.File) : undefined;

      const { walletPublicKey, fileId, sharedKey = "" } = req.body;

      if (!walletPublicKey || !fileId) {
        return res.status(400).send({
          message: "walletPublicKey, fileId are required fields",
        });
      }

      const userId = req.userId as string;

      const isUsersFile = await checkIsUsersFile(fileId, userId);

      if (!isUsersFile) {
        console.error(
          `File does not belong to user. fileId: ${fileId}, userId: ${userId}`
        );
        res
          .status(500)
          .send({ result: false, message: "Something went wrong..." });
      }

      const walletPublicKeyInLowerCase = walletPublicKey.trim().toLowerCase();

      await shareFileToAnotherUser(
        walletPublicKeyInLowerCase,
        fileId,
        file?.buffer,
        sharedKey
      );

      await moveFileToSharedBox(userId, fileId);

      return res.status(200).send({ result: true });
    } catch (error) {
      next(error);
    }
  },

  async transferFile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const file = req.file ? (req.file as Express.Multer.File) : undefined;

      const { walletPublicKey, fileId, sharedKey = "" } = req.body;

      if (!walletPublicKey || !fileId) {
        return res.status(400).send({
          message: "walletPublicKey, fileId are required fields",
        });
      }

      const userId = req.userId as string;

      const isUsersFile = await checkIsUsersFile(fileId, userId);

      if (!isUsersFile) {
        console.error(
          `File does not belong to user. fileId: ${fileId}, userId: ${userId}`
        );
        res
          .status(500)
          .send({ result: false, message: "Something went wrong..." });
      }

      const walletPublicKeyInLowerCase = walletPublicKey.trim().toLowerCase();

      await transferFileToAnotherUser(
        userId,
        walletPublicKeyInLowerCase,
        fileId,
        file?.buffer,
        sharedKey
      );

      await moveFileToTransferedBox(userId, fileId);

      return res.status(200).send({ result: true });
    } catch (error) {
      next(error);
    }
  },
};

export default FilesController;