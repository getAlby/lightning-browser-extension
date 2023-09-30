import state from "~/extension/background-script/state";
import { MessageFetchAssetRegistry } from "~/types";

const fetchAssetRegistry = async ({
  args: { psetPreview },
}: MessageFetchAssetRegistry) => {
  try {
    const liquid = await state.getState().getLiquid();
    const registry = await liquid.fetchAssetRegistry(psetPreview);

    return {
      data: registry,
    };
  } catch (e) {
    console.error(e);
    return {
      error: "fetchAssetRegistry failed: " + e,
    };
  }
};

export default fetchAssetRegistry;
