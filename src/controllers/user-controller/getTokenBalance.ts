import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";

import getWalletBalance from "helpers/getWalletBalance";
import { getUserById } from "firebase-api/user";

import { WALLET_BALANCE_CURRRENCIES } from "enums";

export default async function getTokenBalance(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { currency } = req.query as { currency: any };

    if (!currency) {
      return res.status(400).send({ error: "Balance Currency is required" });
    }

    if (!Object.values(WALLET_BALANCE_CURRRENCIES).includes(currency)) {
      return res.status(400).send({ error: "Balance Currency is invalid" });
    }

    const userId = req.userId as string;

    const user = await getUserById(userId);

    if (!user?.wallet) {
      return res.status(404).send({ error: "Wallet not found" });
    }

    const balance = await getWalletBalance(user.wallet.publicKey, currency);

    const balanceFormatted = balance.toFixed(0);

    return res.status(200).send({ balance: balanceFormatted });
  } catch (error) {
    next(error);
  }
}
