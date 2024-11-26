import { Response, NextFunction } from "express";
import { AuthRequest } from "../custom-types/AuthRequest";

import { getUnclaimedFees } from "../helpers/getTokenBalance";
import { calculateTotalSize, getUserById } from "../firebase-api/user";
import { getFiles } from "../firebase-api/file";

const UserController = {
  async getTokenBalance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId as string;

      const user = await getUserById(userId);

      if (!user?.wallet) {
        return res.status(404).send({ error: "Wallet not found" });
      }

      const data = await getUnclaimedFees(user.wallet.publicKey);
      return res.status(200).send(data);
    } catch (error) {
      next(error);
    }
  },

  async getUserData(req: AuthRequest, res: Response, next: NextFunction) {
    const userId = req.userId as string;

    try {
      if (!userId) {
        console.error(`getUserData: User id ${userId} not found`);
        return res.status(500).send({ message: "Internal Server Error" });
      }

      const user = await getUserById(userId);
      const totalSize = await calculateTotalSize(userId);
      const files = await getFiles(userId);

      return res
        .status(200)
        .send({ ...user, totalSize, numberOfFiles: files?.length || 0 });
    } catch (error) {
      next(error);
    }
  },
};

export default UserController;
