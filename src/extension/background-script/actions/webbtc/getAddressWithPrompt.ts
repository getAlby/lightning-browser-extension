import utils from "~/common/lib/utils";
import { Message } from "~/types";

const getAddressWithPrompt = async (message: Message) => {
  try {
    const response = await utils.openPrompt({
      ...message,
      action: "confirmGetAddress",
    });
    return response;
  } catch (e) {
    console.error("getAddress cancelled", e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default getAddressWithPrompt;
