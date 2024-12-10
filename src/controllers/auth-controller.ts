import {
  admin,
  signInWithCustomToken,
  auth,
  signOut,
} from "../config/firebase";

import { authCookieOptions, authMessage } from "../constants";
import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../custom-types/AuthRequest";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { verifySignature } from "../utils/crypto";

import { createUser, getUserByPublicKey } from "../firebase-api/user";

import { WALLETS } from "../enums";

import { createDefaultBoxes } from "../firebase-api/box";

const AuthController = {
  async authWithWallet(req: Request, res: Response, next: NextFunction) {
    const { walletPublicKey, signature, walletType } = req.body;

    try {
      const isEtheriumWallet =
        walletType === WALLETS.METAMASK ||
        walletType === WALLETS.TRUST_WALLET ||
        walletType === WALLETS.RABBY_WALLET;
      const isSolanaWallet = walletType === WALLETS.PHANTOM;

      if (!isEtheriumWallet && !isSolanaWallet) {
        return res.status(400).send({ error: "Invalid walletType" });
      }

      if (!authMessage) {
        return res.status(500).send({ error: "Internal Server Error" });
      }

      const walletPublicKeyInLowerCase = walletPublicKey.trim().toLowerCase();

      let user = null;

      try {
        user = await getUserByPublicKey(walletPublicKeyInLowerCase);
      } catch (error) {
        user = null;
      }

      const isSignatureValid = await verifySignature(
        authMessage,
        signature,
        walletPublicKeyInLowerCase,
        walletType
      );

      if (user) {
        if (user.signature !== signature) {
          return res.status(400).send({ error: "Invalid signature" });
        }

        const customToken = await admin.auth().createCustomToken(user.id);

        await signInWithCustomToken(auth, customToken);

        return res.status(200).send({ user, authorization: customToken });
      } else {
        if (!isSignatureValid) {
          return res.status(400).send({ error: "Invalid signature" });
        }

        const newUserData = {
          wallet: {
            publicKey: walletPublicKeyInLowerCase,
            walletProvider: walletType,
          },
          boxIds: [],
          escrowIds: [],
          signature,
          createdAt: FieldValue.serverTimestamp() as Timestamp,
        };

        const newUser = await createUser(
          newUserData,
          walletPublicKeyInLowerCase
        );

        await createDefaultBoxes(walletPublicKeyInLowerCase);

        const customToken = await admin
          .auth()
          .createCustomToken(walletPublicKeyInLowerCase);

        await signInWithCustomToken(auth, customToken);

        return res
          .status(200)
          .send({ user: newUser, authorization: customToken });
      }
    } catch (error) {
      next(error);
    }
  },

  async logOut(req: Request, res: Response, next: NextFunction) {
    try {
      await signOut(auth);
      res.clearCookie("custom_token", authCookieOptions);
      res.status(200).send({ message: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  },

  async checkAuth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        return res.json({ authenticated: false });
      }

      const user = await admin.auth().getUser(req.userId);

      res.json({ authenticated: true, user });
    } catch (error) {
      next(error);
    }
  },
};

export default AuthController;
