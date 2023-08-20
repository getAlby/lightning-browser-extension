import state from "~/extension/background-script/state";
import { MessageGetSwapInfo } from "~/types";

const getSwapInfo = async (message: MessageGetSwapInfo) => {
  try {
    const connector = await state.getState().getConnector();

    if (!connector.getSwapInfo) {
      throw new Error("This connector does not support createSwap");
    }

    const data = await connector.getSwapInfo();

    return {
      data,
    };
  } catch (e) {
    console.error(e);
    return {
      error:
        "Getting swap info failed: " + (e instanceof Error ? e.message : ""),
    };
  }
};

export default getSwapInfo;
