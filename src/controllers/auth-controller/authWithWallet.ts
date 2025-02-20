import { admin, signInWithCustomToken, auth } from "config/firebase";

import { authMessage } from "const";
import { Request, Response, NextFunction } from "express";

import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { verifySignature } from "utils/crypto";

import { createUser, getUserByPublicKey } from "firebase-api/user";

import { createDefaultBoxes } from "firebase-api/box";

import { authSchema } from "schemas";

import { ValidationError } from "yup";
import formatYupError from "helpers/yup/formatYupError";

export default async function authWithWallet(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { walletPublicKey, signature, walletType } = req.body;

    const payload = {
      walletPublicKey,
      signature,
      walletType,
    };

    await authSchema.validate(payload);

    if (!authMessage) {
      return res.status(500).send({ error: "Internal Server Error" });
    }

    const walletPublicKeyInLowerCase = walletPublicKey.trim().toLowerCase();

    await verifySignature(
      authMessage,
      signature,
      walletPublicKeyInLowerCase,
      walletType
    );

    let user = null;

    try {
      user = await getUserByPublicKey(walletPublicKeyInLowerCase);
    } catch {
      user = null;
    }

    if (user) {
      if (user.signature !== signature) {
        return res.status(400).send({ error: "Invalid signature" });
      }

      const customToken = await admin.auth().createCustomToken(user.id);

      await signInWithCustomToken(auth, customToken);

      return res.status(200).send({ user, authorization: customToken });
    } else {
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

      const newUser = await createUser(newUserData, walletPublicKeyInLowerCase);

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
    if (error instanceof ValidationError) {
      return res.status(400).json(formatYupError(error));
    }

    next(error);
  }
}
