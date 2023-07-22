import Alby from "~/extension/background-script/connectors/alby";
import state from "~/extension/background-script/state";
import { MessageGetSwapInfo } from "~/types";

const getSwapInfo = async (message: MessageGetSwapInfo) => {
  try {
    const connector = (await state
      .getState()
      .getConnector()) as unknown as Alby;

    const data = await connector.getSwapInfo();

    return {
      data,
    };
  } catch (e) {
    return {
      error: "getSwapInfo failed: " + e,
    };
  }
};

export default getSwapInfo;
