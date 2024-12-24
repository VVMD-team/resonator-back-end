import { Request, Response, NextFunction } from "express";

import { MAX_FILES } from "const";

const filesValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  if (!req.files || !Array.isArray(req.files)) {
    return res.status(400).json({ message: "No files uploaded" });
  }

  if (req.files.length > MAX_FILES) {
    return res
      .status(400)
      .json({ message: `You can upload a maximum of ${MAX_FILES} files` });
  }

  next();
};

export default filesValidator;
