import { ethers } from "ethers";
import nacl from "tweetnacl";
import bs58 from "bs58";

import { WALLETS } from "../../enums";

export default async function verifySignature(
  message: string,
  signature: string,
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
      const recoveredPublicKey = ethers.verifyMessage(message, signature);

      const messageHash = ethers.hashMessage(message);
      const recoveredPublicKeyWHASH = ethers.verifyMessage(
        messageHash,
        signature
      );

      console.log("verifySignature: ", { publicKey });

      console.log("verifySignature: ", { recoveredPublicKeyWHASH });

      console.log("verifySignature: ", { recoveredPublicKey });

      console.log(
        "verifySignature WHASH : ",
        recoveredPublicKeyWHASH.toLowerCase() === publicKey.toLowerCase()
      );
      console.log(
        "verifySignature2 : ",
        recoveredPublicKey.toLowerCase() === publicKey.toLowerCase()
      );
      return recoveredPublicKey.toLowerCase() === publicKey.toLowerCase();
    }
  } catch (error) {
    throw new Error(`Error verifying signature: ${error}`);
  }
}
