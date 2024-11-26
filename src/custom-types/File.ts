import { Timestamp } from "firebase-admin/firestore";

export type File = {
  ownerIds: string[];
  name: string;
  size: number;
  mimetype: string;
  createdAt: Timestamp;
  fileTransactionHash: string;
  filePath: string;
  publicUrl: string;
  sharedKey?: string;
};
