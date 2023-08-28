import utils from "~/common/lib/utils";
import { getHostFromSender } from "~/common/utils/helpers";
import type { MessageAllowanceEnable, Sender } from "~/types";

const providerOnboard = async (
  message: MessageAllowanceEnable,
  sender: Sender
) => {
  const host = getHostFromSender(sender);
  if (!host) return;

  try {
    const response = await utils.openPrompt<{
      enabled: boolean;
      remember: boolean;
    }>(message);

    return {
      data: {
        enabled: response.data.enabled,
        remember: response.data.remember,
      },
    };
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
      return { error: e.message };
    }
  }
};

export default providerOnboard;
