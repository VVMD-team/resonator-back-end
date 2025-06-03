import { isProduction } from "const";

export enum COLLECTIONS {
  users = "users",
  boxes = "boxes",
  files = "files",
  escrows = "escrows",
  notifications = "notifications",
  conversations = "conversations",
  messages = "messages",
}

export enum WALLETS {
  METAMASK = "METAMASK",
  TRUST_WALLET = "TRUST_WALLET",
  PHANTOM = "PHANTOM",
  RABBY_WALLET = "RABBY_WALLET",
}

export enum BOX_TYPES {
  custom = "custom",
  shared = "shared",
  transfered = "transfered",
  files_for_sell = "files_for_sell",
  files_bought = "files_bought",
  default = "default",
}

export enum ESCROW_DEALS {
  file_to_funds = "file_to_funds",
  funds_to_file = "funds_to_file",
  file_to_file = "file_to_file",
  funds_to_funds = "funds_to_funds",
}

enum ProdCurrencies {
  ETH = "ETH",
  RSN = "RSN",
  WBTC = "WBTC",
  USDT = "USDT",
  USDC = "USDC",
  INFRA = "INFRA",
  M87 = "M87",
  VERTAI = "VERTAI",
  BERRY = "BERRY",
  ALVA = "ALVA",
  QF = "QF",
  SYNK = "SYNK",
  FRAGMA = "FRAGMA",
}
enum DevCurrencies {
  ETH = "ETH",
  TEST_TOKEN = "TEST_TOKEN",
  UNICORN_SUPER_ROCKET_TOKEN = "UNICORN_SUPER_ROCKET_TOKEN",
}
export type CURRENCIES = typeof isProduction extends true
  ? keyof typeof ProdCurrencies
  : keyof typeof DevCurrencies;
export const currencyValues = isProduction
  ? Object.values(ProdCurrencies)
  : Object.values(DevCurrencies);

export enum ESCROW_STATUSES {
  in_progress = "in_progress",
  completed = "completed",
  canceled_by_owner = "canceled_by_owner",
  canceled_by_counterparty = "canceled_by_counterparty",
  expired = "expired",
}

export enum ESCROW_FILE_STATUSES {
  on_sell = "on_sell",
  sold = "sold",
  cancelled = "cancelled",
}

export enum NOTIFICATION_TYPES {
  escrow = "escrow",
}

export enum WS_DATA_TYPES {
  message = "message",
  conversation = "conversation",
  escrow_notification = "escrow_notification",
  delete_conversation = "delete_conversation",
  update_conversation = "update_conversation",
}
