const { ethers } = require("ethers");
const path = require("path");

const jsonFilePath = path.join(__dirname, "/src/constants/abi.json");

const abi = require(jsonFilePath);

const rsnContract = "0xF8a0A167BEa66247425ef9CB9B622a4B320B8bB6";

const infuraProvider = new ethers.InfuraProvider(
  "homestead",
  process.env.INFURA_API_KEY
);

const getRsnAmount = async (walletAddress: string) => {
  const contract = new ethers.Contract(rsnContract, abi, infuraProvider);

  const balance = await contract.balanceOf(walletAddress);

  const balanceFormatted = ethers.formatUnits(balance, 18);

  return balanceFormatted;
};

export const getUnclaimedFees = async (walletAddress: string) => {
  const rsnInWallet = await getRsnAmount(walletAddress);

  const rsn = +rsnInWallet;

  return {
    rsnAmount: rsn.toFixed(0)
  };
};