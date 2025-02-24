import { Wallet } from "../custom-types/Wallet";
import { Timestamp } from "firebase-admin/firestore";

export type User = {
  wallet: Wallet;
  boxIds: string[];
  escrowIds: string[];
  signature: string;
  customPubKey?: string;
  customPrivKey?: string;
  createdAt: Timestamp;
};
