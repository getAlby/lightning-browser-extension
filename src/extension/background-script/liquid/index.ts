import * as secp256k1 from "@noble/secp256k1";
import * as bip39 from "@scure/bip39";
import {
  address,
  bip341,
  crypto as liquidjscrypto,
  networks,
} from "liquidjs-lib";
import { SLIP77Factory, Slip77Interface } from "slip77";
import Mnemonic from "~/extension/background-script/mnemonic";
import { LiquidNetworkType } from "~/types";

import * as tinysecp from "../liquid/secp256k1";
import * as tinysecp256k1Adapter from "./secp256k1";

const LIQUID_DERIVATION_PATH = "m/84'/1776'/0'/0/0";
const LIQUID_DERIVATION_PATH_REGTEST = "m/84'/1'/0'/0/0";

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
  private mnemonic: Mnemonic;
  public privateKey: string;

  constructor(mnemonic: Mnemonic, networkType: LiquidNetworkType) {
    // fix usages of window (unavailable in service worker)
    globalThis.window ??= globalThis.window || {};
    if (!globalThis.window.crypto) {
      globalThis.window.crypto = crypto;
    }

    this.mnemonic = mnemonic;
    this.privateKey = this.deriveLiquidPrivateKeyHex(networkType);
    this.network = networks[networkType];
    if (!this.network) throw new Error(`Invalid network: "${networkType}"`);
    const masterBlindingKey = this.deriveLiquidMasterBlindingKey();
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

  private deriveLiquidPrivateKeyHex(networkType: string) {
    const derivationPath =
      networkType === "liquid"
        ? LIQUID_DERIVATION_PATH
        : LIQUID_DERIVATION_PATH_REGTEST;

    return secp256k1.etc.bytesToHex(
      this.mnemonic.deriveKey(derivationPath).privateKey as Uint8Array
    );
  }

  private deriveLiquidMasterBlindingKey(): string {
    return SLIP77Factory(tinysecp)
      .fromSeed(Buffer.from(bip39.mnemonicToSeedSync(this.mnemonic.mnemonic)))
      .masterKey.toString("hex");
  }
}

export default Liquid;
