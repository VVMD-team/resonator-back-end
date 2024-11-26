import { Box } from "../custom-types/Box";
import { BOX_TYPES } from "../enums";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import generateMockTransactionHash from "../helpers/generateMockTransactionHash";

export const getDefaultBoxes = (userId: string): Box[] => {
  const createdAt = FieldValue.serverTimestamp() as Timestamp;
  const ownerId = userId;

  return [
    {
      ownerId,
      boxTransactionHash: generateMockTransactionHash(),
      name: "Default",
      type: BOX_TYPES.default,
      createdAt,
      fileIds: [],
      size: 0,
    },
    {
      ownerId,
      boxTransactionHash: generateMockTransactionHash(),
      name: "Shared",
      type: BOX_TYPES.shared,
      createdAt,
      fileIds: [],
      size: 0,
    },
    {
      ownerId,
      boxTransactionHash: generateMockTransactionHash(),
      name: "Transfered",
      type: BOX_TYPES.transfered,
      createdAt,
      fileIds: [],
      size: 0,
    },
  ];
};
