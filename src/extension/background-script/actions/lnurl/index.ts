import lnurlLib from "~/common/lib/lnurl";
import type { MessageWebLnLnurl } from "~/types";

import auth from "./auth";
import authWithPrompt from "./authWithPrompt";
import channelRequestWithPrompt from "./channel";
import payWithPrompt from "./pay";
import withdrawWithPrompt from "./withdraw";

/*
  Main entry point for LNURL calls
  returns a messagable response: an object with either a `data` or with an `error`
*/
async function lnurl(message: MessageWebLnLnurl) {
  if (typeof message.args.lnurlEncoded !== "string") return;
  let lnurlDetails;
  try {
    lnurlDetails = await lnurlLib.getDetails(message.args.lnurlEncoded);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to parse LNURL" };
  }

  switch (lnurlDetails.tag) {
    case "channelRequest":
      return channelRequestWithPrompt(message, lnurlDetails);
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
export { authWithPrompt, payWithPrompt, withdrawWithPrompt, auth };
