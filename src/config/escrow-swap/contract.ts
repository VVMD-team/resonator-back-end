import { isProduction } from "const";

import { ethers } from "ethers";
import abi from "./abi";

const testnetUrl = "https://data-seed-prebsc-1-s1.binance.org:8545/"; // BSC testnet
const mainnetUrl = "https://eth.llamarpc.com"; // Etherium mainnet
const url = isProduction ? mainnetUrl : testnetUrl;

const provider = new ethers.JsonRpcProvider(url);

const adminPrivateKey = process.env
  .ESCROW_CONTRACT_ADMIN_WALLET_PRIVATE_KEY as string;

export const adminWallet = new ethers.Wallet(adminPrivateKey, provider);

const contractAddress = process.env.ESCROW_CONTRACT_ADDRESS as string;

export const contract = new ethers.Contract(contractAddress, abi, adminWallet);
