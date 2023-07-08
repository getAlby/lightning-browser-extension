import { secp256k1 } from "@noble/curves/secp256k1";
import {
  address,
  bip341,
  crypto as liquidjscrypto,
  networks,
} from "liquidjs-lib";
import { SLIP77Factory, Slip77Interface } from "slip77";

import * as tinysecp256k1Adapter from "./secp256k1";

function tapTweakHash(pubkey: Buffer, h?: Buffer): Buffer {
  return liquidjscrypto.taggedHash(
    "TapTweak/elements",
    Buffer.concat(h ? [pubkey, h] : [pubkey])
  );
}

function tweakPrivateKey(privKey: Buffer, tweak?: Buffer): Buffer {
  let privateKey = privKey;
  const publicKey = Buffer.from(secp256k1.getPublicKey(privateKey, true));
  if (publicKey[0] === 3) {
    privateKey = Buffer.from(tinysecp256k1Adapter.privateNegate(privKey));
  }

  const tweakedPrivateKey = tinysecp256k1Adapter.privateAdd(
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
    // fix usages of window (unavailable in service worker)
    globalThis.window ??= globalThis.window || {};
    if (!globalThis.window.crypto) {
      globalThis.window.crypto = crypto;
    }

    this.network = networks[network];
    if (!this.network) throw new Error(`Invalid network: "${network}"`);
    this.slip77 =
      SLIP77Factory(tinysecp256k1Adapter).fromMasterBlindingKey(
        masterBlindingKey
      );
  }

  getPublicKey() {
    const publicKey = secp256k1.getPublicKey(
      Buffer.from(this.privateKey, "hex"),
      true
    );
    return Buffer.from(publicKey).toString("hex");
  }

  // getAddress returns the segwit v1 taproot address using the private key
  getAddress(): { address: string; blindingPrivateKey: string } {
    const scriptPubKey = bip341
      .BIP341Factory(tinysecp256k1Adapter)
      .taprootOutputScript(Buffer.from(this.getPublicKey(), "hex"));

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
      blindingPrivateKey: blindingKeys.privateKey.toString("hex"),
    };
  }

  /**
   * make a schnorr signature using the Liquid private key
   * @param sigHash message to sign using the private key
   * @param keyPathOnly true if the signature has to be used for taproot key-path only inputs (will tweak the private key)
   * @returns 64 bytes schnorr signature
   */
  signSchnorr(sigHash: string, keyPathOnly = false): string {
    let privKey = Buffer.from(this.privateKey, "hex");
    if (keyPathOnly) privKey = tweakPrivateKey(privKey);

    const signature = tinysecp256k1Adapter.signSchnorr(
      Buffer.from(sigHash, "hex"),
      privKey,
      Buffer.alloc(32)
    );

    return Buffer.from(signature).toString("hex");
  }
}

export default Liquid;
