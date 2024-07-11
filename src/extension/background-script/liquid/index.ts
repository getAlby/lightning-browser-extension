import * as secp256k1 from "@noble/secp256k1";
import * as bip39 from "@scure/bip39";
import {
  BIP371SigningData,
  Pset,
  Signer,
  TapScriptSig,
  Transaction,
  address,
  bip341,
  crypto as liquidjscrypto,
  networks,
} from "liquidjs-lib";
import { SLIP77Factory, Slip77Interface } from "slip77";
import {
  Esplora,
  fetchAssetRegistry,
} from "~/extension/background-script/liquid/esplora";
import { getPsetPreview } from "~/extension/background-script/liquid/pset";
import Mnemonic from "~/extension/background-script/mnemonic";
import { LiquidNetworkType, PsetPreview } from "~/types";

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
  private networkType: LiquidNetworkType;
  public privateKey: string;

  constructor(mnemonic: Mnemonic, networkType: LiquidNetworkType) {
    this.mnemonic = mnemonic;
    this.privateKey = this.deriveLiquidPrivateKeyHex(networkType);
    this.networkType = networkType;
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

  getPsetPreview(pset: string) {
    return getPsetPreview(pset, this.networkType);
  }

  fetchAssetRegistry(psetPreview: PsetPreview) {
    return fetchAssetRegistry(
      Esplora.fromNetwork(this.networkType),
      psetPreview,
      console.error // do not throw, just log errors
    );
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

  signPset(pset: Pset) {
    const liquidPublicKey = Buffer.from(
      Buffer.from(this.getPublicKey(), "hex")
    ).subarray(1); // remove prefix  to get 32 bytes public key

    const signer = new Signer(pset);

    for (const [inIndex, input] of pset.inputs.entries()) {
      // sign key-path taproot input using liquidPublicKey
      if (
        input.tapInternalKey &&
        input.tapInternalKey.equals(liquidPublicKey)
      ) {
        const sighashType = input.sighashType || Transaction.SIGHASH_DEFAULT;
        const sighash = pset.getInputPreimage(
          inIndex,
          sighashType,
          this.network.genesisBlockHash
        );

        const signature = this.signSchnorr(
          Buffer.from(sighash).toString("hex"),
          true
        );

        const partialSig: BIP371SigningData = {
          tapKeySig: serializeSchnnorrSig(
            Buffer.from(signature, "hex"),
            sighashType
          ),
          genesisBlockHash: this.network.genesisBlockHash,
        };

        signer.addSignature(
          inIndex,
          partialSig,
          Pset.SchnorrSigValidator(tinysecp256k1Adapter)
        );

        continue;
      }

      // sign key-path tapscript leaves using liquidPublicKey
      if (input.tapLeafScript && input.tapLeafScript.length > 0) {
        for (const leaf of input.tapLeafScript) {
          const script = leaf.script.toString("hex");
          if (!script.includes(liquidPublicKey.subarray(1).toString("hex"))) {
            continue;
          }

          const leafHash = bip341.tapLeafHash({
            scriptHex: script,
            version: leaf.leafVersion,
          });

          const sighashType = input.sighashType || Transaction.SIGHASH_DEFAULT;
          const sighash = pset.getInputPreimage(
            inIndex,
            sighashType,
            this.network.genesisBlockHash,
            leafHash
          );

          const signature = this.signSchnorr(sighash.toString("hex"));
          const tapScriptSigs: TapScriptSig[] = [
            {
              leafHash,
              pubkey: liquidPublicKey,
              signature: serializeSchnnorrSig(
                Buffer.from(signature, "hex"),
                sighashType
              ),
            },
          ];

          const partialSig: BIP371SigningData = {
            tapScriptSigs,
            genesisBlockHash: this.network.genesisBlockHash,
          };

          signer.addSignature(
            inIndex,
            partialSig,
            Pset.SchnorrSigValidator(tinysecp256k1Adapter)
          );
        }
      }
    }
    return signer.pset;
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
    return SLIP77Factory(tinysecp256k1Adapter)
      .fromSeed(Buffer.from(bip39.mnemonicToSeedSync(this.mnemonic.mnemonic)))
      .masterKey.toString("hex");
  }
}

export default Liquid;

const serializeSchnnorrSig = (sig: Buffer, hashtype: number) =>
  Buffer.concat([
    sig,
    hashtype !== 0x00 ? Buffer.of(hashtype) : Buffer.alloc(0),
  ]);
