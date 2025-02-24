import { ESCROW_FILE_STATUSES } from "enums";
import { Base64String } from "./helpers";

type FileShort = {
  name: string;
  size: number;
  mimetype: string;
  escrowFileStatus?: ESCROW_FILE_STATUSES;
  fileContractId?: string;
};

export type FileDTOShort = FileShort & { id: string };

type FileBase = FileShort & {
  createdAt: string;
  fileTransactionHash: string;
  encryptedIvBase64: Base64String;
  encryptedAesKeys: Record<string, Base64String>;
  senderPublicKeyHex: string;
  ownerIds: string[];

  // old fields
  sharedKey?: string;
};
export type FileDTO = FileBase & { id: string };

export type File = FileBase & {
  ipfsHash: string;

  // old fields
  filePath?: string;
  publicUrl?: string;
};
