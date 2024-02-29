import * as secp256k1 from "@noble/secp256k1";
import * as bitcoin from "bitcoinjs-lib";
import ECPairFactory, { ECPairAPI } from "ecpair";
import {
  Network,
  networks,
} from "~/extension/background-script/bitcoin/networks";
import Mnemonic from "~/extension/background-script/mnemonic";
import {
  Address,
  BitcoinAddress,
  BitcoinNetworkType,
  PsbtPreview,
} from "~/types";

const BTC_TAPROOT_DERIVATION_PATH = "m/86'/0'/0'/0";
const BTC_TAPROOT_DERIVATION_PATH_REGTEST = "m/86'/1'/0'/0";

import * as ecc from "@bitcoinerlab/secp256k1";

class Bitcoin {
  readonly networkType: BitcoinNetworkType;
  readonly mnemonic: Mnemonic;
  readonly network: Network;

  constructor(mnemonic: Mnemonic, networkType: BitcoinNetworkType) {
    this.mnemonic = mnemonic;
    this.networkType = networkType;
    this.network = networks[this.networkType];
    bitcoin.initEccLib(ecc);
  }

  signPsbt(psbt: string) {
    const index = 0;
    const derivationPathWithoutIndex =
      this.networkType === "bitcoin"
        ? BTC_TAPROOT_DERIVATION_PATH
        : BTC_TAPROOT_DERIVATION_PATH_REGTEST;

    const derivationPath = `${derivationPathWithoutIndex}/${index}`;
    const derivedKey = this.mnemonic.deriveKey(derivationPath);

    const taprootPsbt = bitcoin.Psbt.fromHex(psbt, {
      network: this.network,
    });

    const ECPair: ECPairAPI = ECPairFactory(ecc);

    const keyPair = tweakSigner(
      ECPair,
      ECPair.fromPrivateKey(Buffer.from(derivedKey.privateKey as Uint8Array), {
        network: this.network,
      }),
      {
        network: this.network,
      }
    );

    // Step 1: Sign the Taproot PSBT inputs
    taprootPsbt.data.inputs.forEach((input, index) => {
      taprootPsbt.signTaprootInput(index, keyPair);
    });

    // Step 2: Finalize the Taproot PSBT
    taprootPsbt.finalizeAllInputs();

    // Step 3: Get the finalized transaction
    const signedTransaction = taprootPsbt.extractTransaction().toHex();

    return signedTransaction;
  }
  getTaprootAddress(): BitcoinAddress {
    const index = 0;
    const derivationPathWithoutIndex =
      this.networkType === "bitcoin"
        ? BTC_TAPROOT_DERIVATION_PATH
        : BTC_TAPROOT_DERIVATION_PATH_REGTEST;

    const derivationPath = `${derivationPathWithoutIndex}/${index}`;
    const derivedKey = this.mnemonic.deriveKey(derivationPath);

    const { address } = bitcoin.payments.p2tr({
      internalPubkey: toXOnly(Buffer.from(derivedKey.publicKey as Uint8Array)),
      network: this.network,
    });
    if (!address) {
      throw new Error("No taproot address found from private key");
    }
    return {
      address,
      derivationPath,
      index,
      publicKey: secp256k1.etc.bytesToHex(derivedKey.publicKey as Uint8Array),
    };
  }

  getPsbtPreview(psbt: string): PsbtPreview {
    const unsignedPsbt = bitcoin.Psbt.fromHex(psbt, {
      network: this.network,
    });

    const preview: PsbtPreview = {
      inputs: [],
      outputs: [],
      fee: 0,
    };

    for (let i = 0; i < unsignedPsbt.data.inputs.length; i++) {
      const pubkey: Buffer | undefined =
        unsignedPsbt.data.inputs[i].tapInternalKey ||
        unsignedPsbt.data.inputs[i].tapBip32Derivation?.[0]?.pubkey;

      let address = "UNKNOWN";
      if (pubkey) {
        const pubkeyAddress = bitcoin.payments.p2tr({
          internalPubkey: pubkey,
          network: this.network,
        }).address;
        if (pubkeyAddress) {
          address = pubkeyAddress;
        }
      }
      const witnessUtxo = unsignedPsbt.data.inputs[i].witnessUtxo;
      if (!witnessUtxo) {
        throw new Error("No witnessUtxo in input " + i);
      }

      preview.inputs.push({
        amount: unsignedPsbt.data.inputs[i].witnessUtxo?.value || 0,
        address,
      });
    }
    for (let i = 0; i < unsignedPsbt.data.outputs.length; i++) {
      const txOutput = unsignedPsbt.txOutputs[i];

      const address =
        txOutput.address ||
        (txOutput.script &&
          (() => {
            try {
              return bitcoin.address.fromOutputScript(
                txOutput.script,
                this.network
              );
            } catch (error) {
              console.error(error);
            }
            return undefined;
          })()) ||
        "UNKNOWN";

      const previewOutput: Address = {
        amount: txOutput.value,
        address,
      };
      preview.outputs.push(previewOutput);
    }

    for (const input of preview.inputs) {
      preview.fee += input.amount;
    }
    for (const output of preview.outputs) {
      preview.fee -= output.amount;
    }

    return preview;
  }
}

export default Bitcoin;

// Below code taken from https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/test/integration/taproot.spec.ts#L636
const toXOnly = (pubKey: Buffer) =>
  pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);

function tweakSigner(
  ECPair: ECPairAPI,
  signer: bitcoin.Signer,
  opts: { network: bitcoin.Network; tweakHash?: Buffer | undefined }
): bitcoin.Signer {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let privateKey: Uint8Array | undefined = signer.privateKey;
  if (!privateKey) {
    throw new Error("Private key is required for tweaking signer!");
  }
  if (signer.publicKey[0] === 3) {
    privateKey = ecc.privateNegate(privateKey);
  }

  const tweakedPrivateKey = ecc.privateAdd(
    privateKey,
    tapTweakHash(toXOnly(signer.publicKey), opts.tweakHash)
  );
  if (!tweakedPrivateKey) {
    throw new Error("Invalid tweaked private key!");
  }

  return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
    network: opts.network,
  });
}

function tapTweakHash(pubKey: Buffer, h: Buffer | undefined): Buffer {
  return bitcoin.crypto.taggedHash(
    "TapTweak",
    Buffer.concat(h ? [pubKey, h] : [pubKey])
  );
}
