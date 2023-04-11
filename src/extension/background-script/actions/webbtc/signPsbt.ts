import * as secp256k1 from "@noble/secp256k1";
import { Transaction } from "@scure/btc-signer";
import { MessageSignPsbt } from "~/types";

const signPsbt = async (message: MessageSignPsbt) => {
  try {
    const privateKey = secp256k1.utils.hexToBytes(
      "0101010101010101010101010101010101010101010101010101010101010101"
    );

    console.log("🔑 Private key", privateKey);

    const psbtBytes = secp256k1.utils.hexToBytes(message.args.psbt);

    console.log("🔟 psbtBytes", psbtBytes);

    const transaction = Transaction.fromPSBT(psbtBytes); // PSBT tx

    console.log("🔑 Decoded transaction", transaction);

    const result = transaction.sign(privateKey);

    return {
      data: {
        status: "OK",
        signed: result,
      },
    };
  } catch (e) {
    return {
      error: "signPsbt failed: " + e,
    };
  }
};

export default signPsbt;
