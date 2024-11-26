import { WALLETS } from "../enums";

export type Wallet = {
  publicKey: string;
  walletProvider: WALLETS;
};
