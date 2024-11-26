import { Request, Response, NextFunction } from "express";

export default function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error("Error:", err);

  const statusCode = (err as any).status || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({ success: false, status: statusCode, message });
}
