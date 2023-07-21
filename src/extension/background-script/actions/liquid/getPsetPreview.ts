import { getPsetPreview as getPsetPreviewInternal } from "~/extension/background-script/liquid/pset";
import { MessageGetPSetPreview } from "~/types";

const getPsetPreview = async ({
  args: { pset, networkType },
}: MessageGetPSetPreview) => {
  try {
    const preview = getPsetPreviewInternal(pset, networkType);

    return {
      data: preview,
    };
  } catch (e) {
    return {
      error: "getPsetPreview failed: " + e,
    };
  }
};

export default getPsetPreview;
