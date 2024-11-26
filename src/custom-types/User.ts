import { Wallet } from "../custom-types/Wallet";
import { Timestamp } from "firebase-admin/firestore";

export type User = {
  wallet: Wallet;
  boxIds: string[];
  signature: string;
  createdAt: Timestamp;
};
