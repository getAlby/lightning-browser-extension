import utils from "~/common/lib/utils";
// import state from "~/extension/background-script/state";
import type { MessageLNURLChannel, LNURLDetails } from "~/types";

async function channelRequestWithPrompt(
  message: MessageLNURLChannel,
  lnurlDetails: LNURLDetails
) {
  try {
    const response = await utils.openPrompt({
      origin: message.origin,
      action: "lnurlOpenChannel",
      args: { ...message.args, lnurlDetails },
    });

    return response; // response is an object like: `{ data: ... }`
  } catch (e) {
    return { error: e instanceof Error ? e.message : e };
  }
}

export default channelRequestWithPrompt;
