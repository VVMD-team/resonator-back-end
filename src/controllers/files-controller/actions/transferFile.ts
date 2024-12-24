import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";
import { transferFileToAnotherUser, checkIsUsersFile } from "firebase-api/file";

export default async function transferFile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
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

    return res.status(200).send({ result: true });
  } catch (error) {
    next(error);
  }
}
