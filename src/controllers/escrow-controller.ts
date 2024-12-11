import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../custom-types/AuthRequest";
import { createEscrow, getEscrowsByUserId } from "../firebase-api/escrow";
import { setEscrowToUser } from "../firebase-api/user";

import { ESCROW_DEALS } from "enums";

const EscrowController = {
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
