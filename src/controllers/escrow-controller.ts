import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../custom-types/AuthRequest";
import { createEscrow, getEscrowsByUserId } from "../firebase-api/escrow";
import { setEscrowToUser } from "../firebase-api/user";

import { ESCROW_DEALS } from "enums";

import { uploadFileSingle } from "utils/file/uploadFile";

const EscrowController = {
  /**
   * TODO
   * Add get endpoint functions
   */
  async getAllEscrows(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId as string;

      const escrows = await getEscrowsByUserId(userId);

      return res.status(200).send({ data: escrows, total: escrows.length });
    } catch (error) {
      next(error);
    }
  },

  async createEscrow(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId as string;

      const file = req.file ? (req.file as Express.Multer.File) : undefined;

      if (!file) {
        return res.status(400).send({ message: "File is required" });
      }

      const addedFile = await uploadFileSingle({
        file,
        fileRequestData: req.body.file,
        userId,
        isCheckSize: false,
        boxId: req.body.boxId,
      });

      const ownersFileId = addedFile.id;

      console.log({ ownersFileId });

      /* TODO collect and validate incoming data 
        const { name, description, dealType, counterpartyAddress } = req.body;

        if (!name || !description || !dealType || !counterpartyAddress) {
          return res.status(400).send({
            message:
              "All fields (name, description, dealType, counterpartyAddress) are required",
          });
        }
      
      */

      /* TODO create escrow 
        
        const newEscrow = await createEscrow(createEscrowData);

        await setEscrowToUser(newEscrow?.id, userId);

        return res.status(200).send(newEscrow);
      */
    } catch (error) {
      next(error);
    }
  },
};

export default EscrowController;
