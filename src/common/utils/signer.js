import elliptic from "elliptic";
const ec = new elliptic.ec("secp256k1");

class HashKeySigner {
  constructor(keyHex) {
    this.keyHex = keyHex;
    if (!keyHex) {
      throw new Error("Invalid key");
    }
    this.sk = ec.keyFromPrivate(Buffer.from(keyHex, "hex"));
  }

  get pk() {
    return this.sk.getPublic();
  }

  get pkHex() {
    return this.pk.encodeCompressed("hex");
  }

  sign(message) {
    if (!message) {
      throw new Error("Invalid message");
    }
    return this.sk.sign(message, { canonical: true });
  }

  verify(message, signature) {
    return this.sk.verify(message, signature);
  }
}

export default HashKeySigner;
