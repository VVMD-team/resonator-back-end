import { Request, Response, NextFunction } from "express";

import { getBoxById } from "firebase-api/box";

export default async function getOneBox(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.query as { id?: string };

    if (!id) {
      return res.status(400).send({ message: "Box ID is required" });
    }

    const box = await getBoxById(id);

    if (!box)
      return res
        .status(400)
        .send({ message: "Something went wrong with getting box.", box });

    return res.status(200).send({ data: box });
  } catch (error) {
    next(error);
  }
}
