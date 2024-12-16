import { Response, NextFunction } from "express";
import { AuthRequest } from "custom-types/AuthRequest";
import { createEscrow as createEscrowInDB } from "firebase-api/escrow";
import { setEscrowToUser } from "firebase-api/user";

import { ESCROW_DEALS } from "enums";

import { uploadFileSingle } from "utils/file/uploadFile";

export default async function createEscrow(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
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

    const { name, description, dealType, counterpartyAddress } = req.body;

    if (!name || !description || !dealType || !counterpartyAddress) {
      return res.status(400).send({
        message:
          "All fields (name, description, dealType, counterpartyAddress) are required",
      });
    }

    if (!Object.values(ESCROW_DEALS).includes(dealType)) {
      return res.status(400).send({
        message: `Invalid dealType. Must be one of: ${Object.values(
          ESCROW_DEALS
        ).join(", ")}`,
      });
    }

    const createEscrowData = {
      ownerId: userId,
      counterpartyAddress,
      name,
      description,
      dealType,
      ownersFileId,
      createdAt: new Date().toISOString(),
    };

    const newEscrow = await createEscrowInDB(createEscrowData);

    await setEscrowToUser(newEscrow?.id, userId);

    return res.status(200).send(newEscrow);
  } catch (error) {
    next(error);
  }
}
