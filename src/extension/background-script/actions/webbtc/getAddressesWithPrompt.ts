import utils from "~/common/lib/utils";
import { Message } from "~/types";

const getAddressesWithPrompt = async (message: Message) => {
  message.args.index = message.args.index || 0;
  message.args.num = message.args.num || 1;
  message.args.change = message.args.change || false;

  if (typeof message.args.index !== "number") {
    return {
      error: "index missing.",
    };
  }

  if (typeof message.args.num !== "number") {
    return {
      error: "num missing.",
    };
  }

  if (typeof message.args.change !== "boolean") {
    return {
      error: "change missing.",
    };
  }

  try {
    const response = await utils.openPrompt({
      ...message,
      action: "confirmGetAddresses",
    });
    return response;
  } catch (e) {
    console.error("GetAddresses cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default getAddressesWithPrompt;
