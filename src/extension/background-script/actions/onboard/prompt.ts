import utils from "~/common/lib/utils";
import { getHostFromSender } from "~/common/utils/helpers";
import type { MessageAllowanceEnable, Sender } from "~/types";

const prompt = async (message: MessageAllowanceEnable, sender: Sender) => {
  const host = getHostFromSender(sender);
  if (!host) return;

  try {
    await utils.openPrompt(message);
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default prompt;
