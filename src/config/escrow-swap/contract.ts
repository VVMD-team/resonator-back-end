import { isProduction } from "const";

import { ethers } from "ethers";
import abiProd from "./abiProd";
import abiDev from "./abiDev";

const testnetUrl = "https://data-seed-prebsc-1-s1.binance.org:8545/"; // BSC testnet
const mainnetUrl = "https://eth.llamarpc.com"; // Etherium mainnet
const url = isProduction ? mainnetUrl : testnetUrl;
const abi = isProduction ? abiProd : abiDev;

const provider = new ethers.JsonRpcProvider(url);

const adminPrivateKeyDev = process.env
  .ESCROW_CONTRACT_ADMIN_WALLET_PRIVATE_KEY_DEV as string;
const adminPrivateKeyProd = process.env
  .ESCROW_CONTRACT_ADMIN_WALLET_PRIVATE_KEY as string;
const adminPrivateKey = isProduction ? adminPrivateKeyProd : adminPrivateKeyDev;

export const adminWallet = new ethers.Wallet(adminPrivateKey, provider);

const contractAddressDev = process.env.ESCROW_CONTRACT_ADDRESS_DEV as string;
const contractAddressProd = process.env.ESCROW_CONTRACT_ADDRESS as string;
const contractAddress = isProduction ? contractAddressProd : contractAddressDev;

export const contract = new ethers.Contract(contractAddress, abi, adminWallet);
