import { schnorr } from "@noble/curves/secp256k1";
import * as secp256k1 from "@noble/secp256k1";

const liquid = {
  generatePublicKey(privateKey: string) {
    const publicKey = schnorr.getPublicKey(
      secp256k1.etc.hexToBytes(privateKey)
    );
    const publicKeyHex = secp256k1.etc.bytesToHex(publicKey);
    return publicKeyHex;
  },
};

export default liquid;
