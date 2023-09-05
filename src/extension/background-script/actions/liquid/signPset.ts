import { Pset } from "liquidjs-lib";
import state from "~/extension/background-script/state";
import { MessageSignPset } from "~/types";

const signPset = async (message: MessageSignPset) => {
  try {
    const psetBase64 = message.args.pset;
    if (!psetBase64 || typeof psetBase64 !== "string") {
      throw new Error("PSET missing");
    }

    const liquid = await state.getState().getLiquid();

    const pset = Pset.fromBase64(psetBase64);
    const signedPset = liquid.signPset(pset);

    return {
      data: {
        signed: signedPset.toBase64(),
      },
    };
  } catch (e) {
    console.error(e);
    return {
      error: "signPset failed: " + e,
    };
  }
};

export default signPset;
