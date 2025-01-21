import { Timestamp } from "firebase-admin/firestore";
import { ESCROW_DEALS, ESCROW_STATUSES } from "enums";

import { Payment } from "./Payment";

type FileData = {
  fileContractId: string;
  fileName: string;
};

type PaymentData = {
  payment: Payment;
};

type EscrowShort = {
  name: string;
};

type EscrowBase = EscrowShort & {
  contractOrderHash: string;
  ownerId: string;
  counterpartyAddress: string;
  description: string;
  isDeclinedFundsInContract: boolean;
  status: ESCROW_STATUSES;
  createdAt: Timestamp;
};

export type EscrowFileToFunds = EscrowBase & {
  dealType: ESCROW_DEALS.file_to_funds;
  ownerData: FileData;
  requestedCounterpartyData: PaymentData;
  counterpartyData?: PaymentData;
};

export type EscrowFundsToFile = EscrowBase & {
  dealType: ESCROW_DEALS.funds_to_file;
  ownerData: PaymentData;
  requestedCounterpartyData: FileData;
  counterpartyData?: FileData;
};

export type EscrowFileToFile = EscrowBase & {
  dealType: ESCROW_DEALS.file_to_file;
  ownerData: FileData;
  requestedCounterpartyData: FileData;
  counterpartyData?: FileData;
};

export type EscrowFundsToFunds = EscrowBase & {
  dealType: ESCROW_DEALS.funds_to_funds;
  ownerData: PaymentData;
  requestedCounterpartyData: PaymentData;
  counterpartyData?: PaymentData;
};

export type EscrowDTOShort = EscrowShort & { id: string };

export type Escrow =
  | EscrowFileToFunds
  | EscrowFundsToFile
  | EscrowFileToFile
  | EscrowFundsToFunds;
