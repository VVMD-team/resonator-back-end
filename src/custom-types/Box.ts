import { Timestamp } from "firebase-admin/firestore";
import { BOX_TYPES } from "../enums";

export type Box = {
  ownerId: string;
  name: string;
  fileIds: string[];
  size: number; // total files sizes
  createdAt: Timestamp;
  boxTransactionHash: string; // random
  type: BOX_TYPES; // if not custom user can't share the box
};
