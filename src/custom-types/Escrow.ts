import { Timestamp } from "firebase-admin/firestore";
import { ESCROW_DEALS, ESCROW_STATUSES } from "enums";

import { Payment } from "./Payment";

export type BaseEscrow = {
  ownerId: string;
  counterpartyAddress: string;
  name: string;
  description: string;
  status: ESCROW_STATUSES;
  createdAt: Timestamp;
};

// Specific Escrow types for each deal type
export type FileToFundsEscrow = BaseEscrow & {
  dealType: ESCROW_DEALS.file_to_funds;
  fileOfferedId: string;
  paymentRequested: Payment;
};

export type FundsToFileEscrow = BaseEscrow & {
  dealType: ESCROW_DEALS.funds_to_file;
  paymentOffered: Payment;
};

export type FileToFileEscrow = BaseEscrow & {
  dealType: ESCROW_DEALS.file_to_file;
  fileOfferedId: string;
};

export type FundsToFundsEscrow = BaseEscrow & {
  dealType: ESCROW_DEALS.funds_to_funds;
  paymentOffered: Payment;
  paymentRequested: Payment;
};

// Union of all Escrow types
export type Escrow =
  | FileToFundsEscrow
  | FundsToFileEscrow
  | FileToFileEscrow
  | FundsToFundsEscrow;
