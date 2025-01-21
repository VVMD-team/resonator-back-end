import { ethers } from "ethers";
import path from "path";

import { WALLET_BALANCE_CURRRENCIES } from "enums";
import walletBalanceContractsMap from "maps/walletBalanceContractsMap";

const jsonFilePath = path.join(__dirname, "../const/abi.json");
const abi = require(jsonFilePath);

const infuraProvider = new ethers.InfuraProvider(
  "homestead",
  process.env.INFURA_API_KEY
);

export default async function getWalletBalance(
  walletAddress: string,
  currency: WALLET_BALANCE_CURRRENCIES
) {
  if (currency === WALLET_BALANCE_CURRRENCIES.ETH) {
    const balance = await infuraProvider.getBalance(walletAddress);
    const balanceFormatted = ethers.formatUnits(balance, 18);
    return Number(balanceFormatted);
  }

  const contract = new ethers.Contract(
    walletBalanceContractsMap[currency],
    abi,
    infuraProvider
  );

  const balance = await contract.balanceOf(walletAddress);

  const balanceFormatted = ethers.formatUnits(balance, 18);

  return Number(balanceFormatted);
}
