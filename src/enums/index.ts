export enum COLLECTIONS {
  users = "users",
  boxes = "boxes",
  files = "files",
  escrows = "escrows",
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

export enum CURRENCIES {
  ETH = "ETH",
  USDT = "USDT",
  USDC = "USDC",
  BTC = "BTC",
}

export enum ESCROW_STATUSES {
  in_progress = "in_progress",
  completed = "completed",
  canceled_by_owner = "canceled_by_owner",
  canceled_by_counterparty = "canceled_by_counterparty",
  expired = "expired",
}
