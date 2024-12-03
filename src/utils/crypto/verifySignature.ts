import { ethers } from "ethers";
import nacl from "tweetnacl";
import bs58 from "bs58";

import { WALLETS } from "../../enums";
import { recoverMessageAddress } from "viem";
export default async function verifySignature(
  message: string,
  signature: `0x${string}`,
  publicKey: string,
  walletType: WALLETS
): Promise<boolean> {
  try {
    const isSolanaWallet = walletType === WALLETS.PHANTOM;

    if (isSolanaWallet) {
      const msgUint8 = new TextEncoder().encode(message);
      const keyUint8 = bs58.decode(publicKey);
      const sigUint8 = bs58.decode(signature);

      return nacl.sign.detached.verify(msgUint8, sigUint8, keyUint8);
    } else {
      // const recoveredPublicKey = ethers.verifyMessage(message, signature);

      const recoveredPublicKey = await recoverMessageAddress({
        message: message,
        signature: signature,
      });

      console.log({ message, signature, publicKey, recoveredPublicKey });

      return recoveredPublicKey.toLowerCase() === publicKey.toLowerCase();
    }
  } catch (error) {
    throw new Error(`Error verifying signature: ${error}`);
  }
}
