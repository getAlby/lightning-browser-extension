import * as secp256k1 from "@noble/secp256k1";
import { hex } from "@scure/base";
import * as btc from "@scure/btc-signer";
import { decryptData } from "~/common/lib/crypto";
import { getRootPrivateKey } from "~/common/lib/mnemonic";
import state from "~/extension/background-script/state";
import { MessageSignPsbt } from "~/types";

// TODO: Make network (mainnet or testnet) configurable via ENV

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
    const privateKey = secp256k1.utils.hexToBytes(
      //deriveBitcoinPrivateKey(mnemonic, message.args.testnet)
      getRootPrivateKey(mnemonic)
    );

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
