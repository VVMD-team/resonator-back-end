import { IncomingMessage } from "http";

export type AuthIncomingMessage = IncomingMessage & {
  userId?: string;
};
