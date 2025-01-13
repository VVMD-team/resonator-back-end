import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import { checkEscrowValidity as checkEscrowValidityInDB } from "firebase-api/escrow";
import { escrowFinalizeSchema } from "schemas";

import { ESCROW_DEALS } from "enums";

import {
  finalizeFileCurrency,
  finalizeCurrencyFile,
  finalizeFileFile,
  finalizeCurrencyCurrency,
} from "contract-api/escrow-swap";

export default async function finalizeEscrow(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { escrowId, dealType, orderContractId } = req.body;

    await escrowFinalizeSchema.validate({
      escrowId,
      dealType,
      orderContractId,
    });

    await checkEscrowValidityInDB({ escrowId, dealType });

    switch (dealType) {
      case ESCROW_DEALS.file_to_funds:
        await finalizeFileCurrency(orderContractId);
        // change status
        // send file to counterparty
        break;
      case ESCROW_DEALS.funds_to_file:
        await finalizeCurrencyFile(orderContractId);
        // change status
        // send file to owner
        break;
      case ESCROW_DEALS.file_to_file:
        await finalizeFileFile(orderContractId);
        // change status
        // send file to counterparty
        // send file to owner
        break;
      case ESCROW_DEALS.funds_to_funds:
        await finalizeCurrencyCurrency(orderContractId);
        // change status
        break;
      default:
        throw new Error("Invalid deal type");
    }

    return res.status(200).send({ result: true });
  } catch (error) {
    next(error);
  }
}
