import * as secp256k1 from "@noble/secp256k1";

class Liquid {
  privateKey: string;

  constructor(privateKey: string) {
    this.privateKey = privateKey;
  }

  getPublicKey() {
    const publicKey = secp256k1.schnorr.getPublicKey(
      secp256k1.utils.hexToBytes(this.privateKey)
    );
    const publicKeyHex = secp256k1.utils.bytesToHex(publicKey);
    return publicKeyHex;
  }

  async signSchnorr(sigHash: string): Promise<string> {
    const signature = await secp256k1.schnorr.sign(
      Buffer.from(secp256k1.utils.hexToBytes(sigHash)),
      secp256k1.utils.hexToBytes(this.privateKey)
    );
    const signedHex = secp256k1.utils.bytesToHex(signature);
    return signedHex;
  }
}

export default Liquid;
