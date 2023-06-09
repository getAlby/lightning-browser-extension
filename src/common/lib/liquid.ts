import * as secp256k1 from "@noble/secp256k1";

const liquid = {
  generatePublicKey(privateKey: string) {
    const publicKey = secp256k1.schnorr.getPublicKey(
      secp256k1.utils.hexToBytes(privateKey)
    );
    const publicKeyHex = secp256k1.utils.bytesToHex(publicKey);
    return publicKeyHex;
  },
};

export default liquid;
