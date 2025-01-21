import { contract } from "config/escrow-swap/contract";

export const finalizeCurrencyCurrency = async (orderId: number) => {
  return await contract.finalizeCurrencyCurrency(orderId);
};

export const finalizeCurrencyFile = async (orderId: number) => {
  return await contract.finalizeCurrencyFile(orderId);
};

export const finalizeFileCurrency = async (orderId: number) => {
  return await contract.finalizeFileCurrency(orderId);
};

export const finalizeFileFile = async (orderId: number) => {
  return await contract.finalizeFileFile(orderId);
};
