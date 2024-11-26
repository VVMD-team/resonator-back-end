import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../custom-types/AuthRequest";
import {
  createBox,
  getBoxesByUserId,
  getFilesByBoxId,
} from "../firebase-api/box";
import { setBoxToUser, deleteBoxIdFromUser } from "../firebase-api/user";
import {
  deleteBoxById,
  checkBoxType,
  getBoxById,
  checkIsUsersBox,
  shareBoxToAnotherUser,
  transferBoxToAnotherUser,
} from "../firebase-api/box";
import { BOX_TYPES } from "../enums";

const BoxesController = {
  async getAllBoxes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId as string;

      const boxes = await getBoxesByUserId(userId);

      return res.status(200).send({ data: boxes, total: boxes.length });
    } catch (error) {
      next(error);
    }
  },

  async getOneBox(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.query as { id?: string };

      if (!id) {
        return res.status(400).send({ message: "Box ID is required" });
      }

      const box = await getBoxById(id);

      if (!box)
        return res
          .status(400)
          .send({ message: "Something went wrong with getting box.", box });

      return res.status(200).send({ data: box });
    } catch (error) {
      next(error);
    }
  },

  async createBox(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { boxName } = req.body;

      if (!boxName) {
        return res.status(400).send({ message: "Box name is required" });
      }

      const userId = req.userId as string;

      const data = await createBox(boxName, userId);
      await setBoxToUser(data?.id, userId);

      return res.status(200).send({ data });
    } catch (error) {
      next(error);
    }
  },

  async deleteBox(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { boxId } = req.body;

      if (!boxId) {
        return res
          .status(400)
          .send({ result: false, message: "Box ID is required" });
      }

      const userId = req.userId as string;

      const boxType = await checkBoxType(boxId);

      if (boxType !== BOX_TYPES.custom) {
        return res
          .status(400)
          .send({ result: false, message: "You can't delete this box" });
      }

      const resultDeleteBoxById = await deleteBoxById(boxId, userId);

      const resultDeleteBoxIdFromUser = await deleteBoxIdFromUser(
        boxId,
        userId
      );

      const result = resultDeleteBoxById && resultDeleteBoxIdFromUser;

      if (!result) {
        return res
          .status(500)
          .send({ result: false, message: "Something went wrong..." });
      }

      return res.status(200).send({ result });
    } catch (error) {
      next(error);
    }
  },

  async getBoxFiles(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id, is_long } = req.query as { id?: string; is_long?: string };

      if (!id) {
        return res.status(400).send({ message: "Box ID is required" });
      }

      const userId = req.userId as string;

      const files = await getFilesByBoxId(id, userId, is_long === "true");

      res.status(200).send({ files });
    } catch (error) {
      next(error);
    }
  },

  async shareBox(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { walletPublicKey, boxId } = req.body;
      const files = req.files as Express.Multer.File[];

      if (!walletPublicKey || !boxId) {
        return res.status(400).send({
          message: "walletPublicKey, boxId are required fields",
        });
      }

      const rectyptedFiles = files.map((file, index) => {
        const id = req.body.files[index].id;
        const sharedKey = req.body.files[index].sharedKey;

        return {
          id,
          sharedKey,
          fileBuffer: file.buffer,
        };
      });

      const userId = req.userId as string;

      const isUsersBox = await checkIsUsersBox(boxId, userId);

      if (!isUsersBox) {
        console.error(
          `Box does not belong to user. boxId: ${boxId}, userId: ${userId}`
        );
        return res
          .status(500)
          .send({ result: false, message: "Something went wrong..." });
      }

      const walletPublicKeyInLowerCase = walletPublicKey.trim().toLowerCase();

      await shareBoxToAnotherUser({
        userId,
        walletPublicKey: walletPublicKeyInLowerCase,
        boxId,
        rectyptedFiles,
      });

      return res.status(200).send({ result: true });
    } catch (error) {
      next(error);
    }
  },

  async transferBox(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { walletPublicKey, boxId } = req.body;
      const files = req.files as Express.Multer.File[];

      if (!walletPublicKey || !boxId) {
        return res.status(400).send({
          message: "walletPublicKey, boxId are required fields",
        });
      }

      const rectyptedFiles = files.map((file, index) => {
        const id = req.body.files[index].id;
        const sharedKey = req.body.files[index].sharedKey;

        return {
          id,
          sharedKey,
          fileBuffer: file.buffer,
        };
      });

      const userId = req.userId as string;

      const isUsersBox = await checkIsUsersBox(boxId, userId);

      if (!isUsersBox) {
        console.error(
          `Box does not belong to user. boxId: ${boxId}, userId: ${userId}`
        );
        return res
          .status(500)
          .send({ result: false, message: "Something went wrong..." });
      }

      const walletPublicKeyInLowerCase = walletPublicKey.trim().toLowerCase();

      await transferBoxToAnotherUser({
        userId,
        walletPublicKey: walletPublicKeyInLowerCase,
        boxId,
        rectyptedFiles,
      });

      return res.status(200).send({ result: true });
    } catch (error) {
      next(error);
    }
  },
};

export default BoxesController;
