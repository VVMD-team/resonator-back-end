import { ethers } from "ethers";
import abi from "./abi";

const provider = new ethers.JsonRpcProvider(process.env.INFURA_API_KEY);

const adminPrivateKey = process.env
  .ESCROW_CONTRACT_ADMIN_WALLET_PRIVATE_KEY as string;

export const adminWallet = new ethers.Wallet(adminPrivateKey, provider);

const contractAddress = process.env.ESCROW_CONTRACT_ADDRESS as string;

export const contract = new ethers.Contract(contractAddress, abi, adminWallet);
