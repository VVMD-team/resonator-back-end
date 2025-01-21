import { ESCROW_FILE_STATUSES } from "enums";
import { Timestamp } from "firebase-admin/firestore";

type FileShort = {
  name: string;
  size: number;
  mimetype: string;
  escrowFileStatus?: ESCROW_FILE_STATUSES;
  fileContractId?: string;
};
export type FileDTOShort = FileShort & { id: string };

type FileBase = FileShort & {
  createdAt: Timestamp;
  fileTransactionHash: string;
  sharedKey?: string;
};
export type FileDTO = FileBase & { id: string };

export type File = FileBase & {
  ownerIds: string[];
  filePath: string;
  publicUrl: string;
};
