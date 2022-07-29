import utils from "~/common/lib/utils";
import type { MessageLNURLOpenChannel, LNURLDetails } from "~/types";

// relates to: src/extension/content-script/index.js
export type LNURLOpenChannelResponse = {
  application: string;
  response: boolean;
  data: string;
  origin: {
    internal: boolean;
  };
};

async function channelRequestWithPrompt(
  message: MessageLNURLOpenChannel,
  lnurlDetails: LNURLDetails
) {
  try {
    const response = await utils.openPrompt<LNURLOpenChannelResponse>({
      origin: message.origin,
      action: "lnurlOpenChannel",
      args: { ...message.args, lnurlDetails },
    });

    return response;
  } catch (e) {
    return { error: e instanceof Error ? e.message : e };
  }
}

export default channelRequestWithPrompt;
