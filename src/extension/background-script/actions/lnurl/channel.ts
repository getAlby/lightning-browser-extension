import utils from "~/common/lib/utils";
import type { MessageWebLnLnurl, LNURLDetails } from "~/types";

// relates to: src/extension/content-script/index.js
export type LNURLChannelResponse = {
  application: string;
  response: boolean;
  data: string;
  origin: {
    internal: boolean;
  };
};

async function channelRequestWithPrompt(
  message: MessageWebLnLnurl,
  lnurlDetails: LNURLDetails
) {
  try {
    const response = await utils.openPrompt<LNURLChannelResponse>({
      origin: message.origin,
      action: "lnurlChannel",
      args: { ...message.args, lnurlDetails },
    });

    return response;
  } catch (e) {
    return { error: e instanceof Error ? e.message : e };
  }
}

export default channelRequestWithPrompt;
