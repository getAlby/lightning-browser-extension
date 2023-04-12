import * as secp256k1 from "@noble/secp256k1";
import { hex } from "@scure/base";
import { HDKey } from "@scure/bip32";
import * as bip39 from "@scure/bip39";
import * as btc from "@scure/btc-signer";
import { MessageSignPsbt } from "~/types";

// TODO: Load from account
// TODO: Make network configurable via ENV
const mnemonic =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
const seed = bip39.mnemonicToSeedSync(mnemonic);
const hdkey = HDKey.fromMasterSeed(seed);

const signPsbt = async (message: MessageSignPsbt) => {
  try {
    const privateKey = hdkey.privateKey!;

    const psbtBytes = secp256k1.utils.hexToBytes(message.args.psbt);
    const transaction = btc.Transaction.fromPSBT(psbtBytes);

    transaction.sign(privateKey);

    // TODO: Do we need to finalize() here or should that be done by websites?
    transaction.finalize();

    const signedTransaction = hex.encode(transaction.extract());

    return {
      data: {
        signed: signedTransaction,
      },
    };
  } catch (e) {
    return {
      error: "signPsbt failed: " + e,
    };
  }
};

export default signPsbt;
