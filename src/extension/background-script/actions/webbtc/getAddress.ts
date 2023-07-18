import state from "~/extension/background-script/state";
import { MessageGetAddress } from "~/types";

const getAddress = async (message: MessageGetAddress) => {
  try {
    const bitcoin = await state.getState().getBitcoin();

    const data = bitcoin.getTaprootAddress();

    return {
      data,
    };
  } catch (e) {
    console.error("getAddress failed: ", e);
    return {
      error: "getAddress failed: " + e,
    };
  }
};

export default getAddress;
