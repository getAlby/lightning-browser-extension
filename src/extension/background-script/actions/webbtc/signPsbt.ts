import * as secp256k1 from "@noble/secp256k1";
import * as bitcoin from "bitcoinjs-lib";
import ECPairFactory, { ECPairAPI } from "ecpair";
import * as tinysecp from "tiny-secp256k1";
import { decryptData } from "~/common/lib/crypto";
import {
  BTC_TAPROOT_DERIVATION_PATH,
  BTC_TAPROOT_DERIVATION_PATH_REGTEST,
  derivePrivateKey,
} from "~/common/lib/mnemonic";
import state from "~/extension/background-script/state";
import { MessageSignPsbt } from "~/types";

const signPsbt = async (message: MessageSignPsbt) => {
  try {
    // TODO: is this the correct way to decrypt the mnmenonic?
    const password = await state.getState().password();
    if (!password) {
      throw new Error("No password set");
    }
    const account = await state.getState().getAccount();
    if (!account) {
      throw new Error("No account selected");
    }
    if (!account.mnemonic) {
      throw new Error("No mnemonic set");
    }
    const mnemonic = decryptData(account.mnemonic, password);
    const settings = state.getState().settings;

    const derivationPath =
      settings.bitcoinNetwork === "bitcoin"
        ? BTC_TAPROOT_DERIVATION_PATH
        : BTC_TAPROOT_DERIVATION_PATH_REGTEST;

    const privateKey = secp256k1.utils.hexToBytes(
      derivePrivateKey(mnemonic, derivationPath)
    );

    const taprootPsbt = bitcoin.Psbt.fromHex(message.args.psbt, {
      network: bitcoin.networks[settings.bitcoinNetwork],
    });

    // fix usages of window (unavailable in service worker)
    globalThis.window = globalThis.window || {};
    if (!globalThis.window.crypto) {
      globalThis.window.crypto = crypto;
    }

    bitcoin.initEccLib(tinysecp);
    const ECPair: ECPairAPI = ECPairFactory(tinysecp);

    const keyPair = tweakSigner(
      ECPair,
      ECPair.fromPrivateKey(Buffer.from(privateKey), {
        network: bitcoin.networks[settings.bitcoinNetwork],
      }),
      {
        network: bitcoin.networks[settings.bitcoinNetwork],
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

    return {
      data: {
        signed: signedTransaction,
      },
    };
  } catch (e) {
    console.error("signPsbt failed: ", e);
    return {
      error: "signPsbt failed: " + e,
    };
  }
};

export default signPsbt;

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
    privateKey = tinysecp.privateNegate(privateKey);
  }

  const tweakedPrivateKey = tinysecp.privateAdd(
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
