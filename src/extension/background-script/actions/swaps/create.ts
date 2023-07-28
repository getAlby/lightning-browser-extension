import Alby from "~/extension/background-script/connectors/alby";
import state from "~/extension/background-script/state";
import { MessageCreateSwap } from "~/types";

const createSwap = async (message: MessageCreateSwap) => {
  try {
    const connector = (await state
      .getState()
      .getConnector()) as unknown as Alby;

    const data = await connector.createSwap(message.args);

    return {
      data,
    };
  } catch (e) {
    return {
      error: "Creating swap failed: " + e,
    };
  }
};

export default createSwap;