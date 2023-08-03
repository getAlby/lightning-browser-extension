import state from "~/extension/background-script/state";
import { MessageGetPSetPreview } from "~/types";

const getPsetPreview = async ({ args: { pset } }: MessageGetPSetPreview) => {
  try {
    const liquid = await state.getState().getLiquid();
    const preview = liquid.getPsetPreview(pset);

    return {
      data: preview,
    };
  } catch (e) {
    console.error(e);
    return {
      error: "getPsetPreview failed: " + e,
    };
  }
};

export default getPsetPreview;
