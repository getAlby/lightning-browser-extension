import lnurlLib from "~/common/lib/lnurl";
import type { Message } from "~/types";

import authWithPrompt from "./auth";
import payWithPrompt from "./pay";
import withdrawWithPrompt from "./withdraw";

/*
  Main entry point for LNURL calls
  returns a messagable response: an object with either a `data` or with an `error`
*/
async function lnurl(message: Message) {
  if (typeof message.args.lnurlEncoded !== "string") return;
  let lnurlDetails;
  try {
    lnurlDetails = await lnurlLib.getDetails(message.args.lnurlEncoded);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to parse LNURL" };
  }

  switch (lnurlDetails.tag) {
    case "channelRequest":
      console.error("lnurl-channel is not implemented");
      // TODO: add support for LNURL channel
      // connectPeer method in connector
      return { error: "not implemented" };
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
export { authWithPrompt, payWithPrompt, withdrawWithPrompt };
