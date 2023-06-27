import * as secp256k1 from "@noble/secp256k1";
import { address, bip341, crypto, networks } from "liquidjs-lib";
import { SLIP77Factory, Slip77Interface } from "slip77";
import * as tinysecp from "tiny-secp256k1";

function tapTweakHash(pubkey: Buffer, h?: Buffer): Buffer {
  return crypto.taggedHash(
    "TapTweak/elements",
    Buffer.concat(h ? [pubkey, h] : [pubkey])
  );
}

function tweakPrivateKey(privKey: Buffer, tweak?: Buffer): Buffer {
  let privateKey = privKey;
  const publicKey = Buffer.from(secp256k1.getPublicKey(privateKey, true));
  if (publicKey[0] === 3) {
    privateKey = Buffer.from(tinysecp.privateNegate(privKey));
  }

  const tweakedPrivateKey = tinysecp.privateAdd(
    privateKey,
    tapTweakHash(publicKey.subarray(1), tweak)
  );

  if (!tweakedPrivateKey) {
    throw new Error("Invalid tweaked private key");
  }

  return Buffer.from(tweakedPrivateKey);
}

class Liquid {
  private slip77: Slip77Interface;
  private network: networks.Network;

  constructor(
    public privateKey: string,
    masterBlindingKey: string,
    network: "liquid" | "testnet" | "regtest"
  ) {
    this.network = networks[network];
    if (!this.network) throw new Error(`Invalid network: "${network}"`);
    this.slip77 =
      SLIP77Factory(tinysecp).fromMasterBlindingKey(masterBlindingKey);
  }

  getPublicKey() {
    const publicKey = secp256k1.getPublicKey(
      secp256k1.utils.hexToBytes(this.privateKey),
      true
    );
    return secp256k1.utils.bytesToHex(publicKey);
  }

  // getAddress returns the segwit v1 taproot address using the private key
  getAddress(): { address: string; blindingPrivateKey: string } {
    const scriptPubKey = bip341
      .BIP341Factory(tinysecp)
      .taprootOutputScript(
        Buffer.from(secp256k1.utils.hexToBytes(this.getPublicKey()))
      );

    const unconfidentialAddr = address.fromOutputScript(
      scriptPubKey,
      this.network
    );
    const blindingKeys = this.slip77.derive(scriptPubKey);

    if (!blindingKeys.publicKey || !blindingKeys.privateKey) {
      throw new Error("Invalid blinding keys");
    }

    const confidentialAddr = address.toConfidential(
      unconfidentialAddr,
      blindingKeys.publicKey
    );

    return {
      address: confidentialAddr,
      blindingPrivateKey: secp256k1.utils.bytesToHex(blindingKeys.privateKey),
    };
  }

  signSchnorr(sigHash: string, keyPathOnly = false): string {
    let privKey = Buffer.from(secp256k1.utils.hexToBytes(this.privateKey));
    if (keyPathOnly) privKey = tweakPrivateKey(privKey);

    const signature = tinysecp.signSchnorr(
      Buffer.from(secp256k1.utils.hexToBytes(sigHash)),
      privKey,
      Buffer.alloc(32)
    );
    const signedHex = secp256k1.utils.bytesToHex(signature);
    return signedHex;
  }
}

export default Liquid;
