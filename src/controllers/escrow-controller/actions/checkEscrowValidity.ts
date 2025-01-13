import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { checkEscrowValidity as checkEscrowValidityInDB } from "firebase-api/escrow";

import { escrowCheckValiditySchema } from "schemas";

export default async function checkEscrowValidity(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { escrowId, dealType } = req.body;

    await escrowCheckValiditySchema.validate({ escrowId, dealType });

    await checkEscrowValidityInDB({ escrowId, dealType });

    return res.status(200).send({ result: true });
  } catch (error) {
    next(error);
  }
}
