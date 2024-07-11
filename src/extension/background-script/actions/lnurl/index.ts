import lnurlLib from "~/common/lib/lnurl";
import { isLNURLDetailsError } from "~/common/utils/typeHelpers";
import type { MessageWebLnLnurl, Sender } from "~/types";

import auth from "./auth";
import authOrPrompt from "./authOrPrompt";
import channelRequestWithPrompt from "./channel";
import payWithPrompt from "./pay";
import withdrawWithPrompt from "./withdraw";

/*
  Main entry point for LNURL calls
  returns a messagable response: an object with either a `data` or with an `error`
*/
async function lnurl(message: MessageWebLnLnurl, sender: Sender) {
  if (typeof message.args.lnurlEncoded !== "string") return;
  let lnurlDetails;
  try {
    lnurlDetails = await lnurlLib.getDetails(message.args.lnurlEncoded);
    if (isLNURLDetailsError(lnurlDetails)) {
      return { error: lnurlDetails.reason };
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to parse LNURL" };
  }

  switch (lnurlDetails.tag) {
    case "channelRequest":
      return channelRequestWithPrompt(message, lnurlDetails);
    case "login":
      return authOrPrompt(message, sender, lnurlDetails);
    case "payRequest":
      return payWithPrompt(message, lnurlDetails);
    case "withdrawRequest":
      return withdrawWithPrompt(message, lnurlDetails);
    default:
      return { error: "not implemented" };
  }
}

export default lnurl;
export { auth, authOrPrompt, payWithPrompt, withdrawWithPrompt };
