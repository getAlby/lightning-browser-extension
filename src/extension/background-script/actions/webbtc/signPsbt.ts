import state from "~/extension/background-script/state";
import { MessageSignPsbt } from "~/types";

const signPsbt = async (message: MessageSignPsbt) => {
  try {
    const bitcoin = await state.getState().getBitcoin();

    const signedTransaction = await bitcoin.signPsbt(message.args.psbt);
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
