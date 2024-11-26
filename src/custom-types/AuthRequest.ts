import { Request } from "express";

// makes typescript work correctly
export type AuthRequest = Request & {
  userId?: string;
};
