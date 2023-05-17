import * as secp256k1 from "@noble/secp256k1";
import { hex } from "@scure/base";
import * as btc from "@scure/btc-signer";
import { decryptData } from "~/common/lib/crypto";
import {
  BTC_TAPROOT_DERIVATION_PATH,
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
    const derivationPath = account.bip32DerivationPath
      ? decryptData(account.bip32DerivationPath, password)
      : undefined;
    const privateKey = secp256k1.utils.hexToBytes(
      // TODO: allow account to specify derivation path
      derivePrivateKey(mnemonic, derivationPath || BTC_TAPROOT_DERIVATION_PATH)
    );

    const psbtBytes = secp256k1.utils.hexToBytes(message.args.psbt);
    const transaction = btc.Transaction.fromPSBT(psbtBytes);

    // this only works with a single input
    // TODO: support signing individual inputs
    transaction.sign(privateKey);

    // TODO: Do we need to finalize() here or should that be done by websites?
    // if signing individual inputs, each should be finalized individually
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
