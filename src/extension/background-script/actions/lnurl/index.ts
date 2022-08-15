import lnurlLib from "~/common/lib/lnurl";
import type { Message, MessageLNURLChannel } from "~/types";

import authWithPrompt from "./auth";
import channelRequestWithPrompt from "./channel";
import lnurlAuth from "./lnurlAuth";
import payWithPrompt from "./pay";
import withdrawWithPrompt from "./withdraw";

/*
  Main entry point for LNURL calls
  returns a messagable response: an object with either a `data` or with an `error`
*/
async function lnurl(message: Message | MessageLNURLChannel) {
  if (typeof message.args.lnurlEncoded !== "string") return;
  let lnurlDetails;
  try {
    lnurlDetails = await lnurlLib.getDetails(message.args.lnurlEncoded);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to parse LNURL" };
  }

  switch (lnurlDetails.tag) {
    case "channelRequest":
      if ("public" in message) {
        return channelRequestWithPrompt(message, lnurlDetails);
      } else {
        console.error("Wrong 'message' type: ", message);
        return;
      }
    case "login":
      return authWithPrompt(message, lnurlDetails);
    case "payRequest":
      return payWithPrompt(message, lnurlDetails);
    case "withdrawRequest":
      return withdrawWithPrompt(message, lnurlDetails);
    default:
      return { error: "not implemented" };
  }
}

export default lnurl;
export { authWithPrompt, payWithPrompt, withdrawWithPrompt, lnurlAuth };
