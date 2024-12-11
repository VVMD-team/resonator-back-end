import { Timestamp } from "firebase-admin/firestore";
import { ESCROW_DEALS, ESCROW_STATUSES } from "enums";

import { Payment } from "./Payment";

type FileData = {
  fileId: string;
};

type EscrowBase = {
  ownerId: string;
  counterpartyAddress: string;
  name: string;
  description: string;
  status: ESCROW_STATUSES;
  createdAt: Timestamp;
};

// Specific Escrow types for each deal type
type EscrowFileToFunds = EscrowBase & {
  dealType: ESCROW_DEALS.file_to_funds;
  ownerData: FileData;
  requestedCounterpartyData: { payment: Payment };
  counterpartyData?: { payment: Payment };
};

type EscrowFundsToFile = EscrowBase & {
  dealType: ESCROW_DEALS.funds_to_file;
  ownerData: { payment: Payment };
  requestedCounterpartyData: null;
  counterpartyData?: FileData;
};

type EscrowFileToFile = EscrowBase & {
  dealType: ESCROW_DEALS.file_to_file;
  ownerData: FileData;
  requestedCounterpartyData: null;
  counterpartyData?: FileData;
};

type EscrowFundsToFunds = EscrowBase & {
  dealType: ESCROW_DEALS.funds_to_funds;
  ownerData: { payment: Payment };
  requestedCounterpartyData: { payment: Payment };
  counterpartyData?: { payment: Payment };
};

// Union of all Escrow types
export type Escrow =
  | EscrowFileToFunds
  | EscrowFundsToFile
  | EscrowFileToFile
  | EscrowFundsToFunds;
