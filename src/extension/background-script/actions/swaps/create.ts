import state from "~/extension/background-script/state";
import { MessageCreateSwap } from "~/types";

const createSwap = async (message: MessageCreateSwap) => {
  try {
    const connector = await state.getState().getConnector();

    if (!connector.createSwap) {
      throw new Error("This connector does not support createSwap");
    }
    const data = await connector.createSwap(message.args);

    return {
      data,
    };
  } catch (e) {
    console.error(e);
    return {
      error: "Creating swap failed: " + (e instanceof Error ? e.message : ""),
    };
  }
};

export default createSwap;
