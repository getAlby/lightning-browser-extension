import state from "~/extension/background-script/state";
import { MessageGetPsbtPreview } from "~/types";

const getPsbtPreview = async (message: MessageGetPsbtPreview) => {
  try {
    const bitcoin = await state.getState().getBitcoin();

    const data = bitcoin.getPsbtPreview(message.args.psbt);

    return {
      data,
    };
  } catch (e) {
    console.error("getPsbtPreview failed: ", e);
    return {
      error: "getPsbtPreview failed: " + e,
    };
  }
};

export default getPsbtPreview;
