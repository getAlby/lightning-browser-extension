import lnurlLib from "~/common/lib/lnurl";
import type { Message, MessageLNURLChannel } from "~/types";

import authWithPrompt from "./auth";
import channelRequestWithPrompt from "./channel";
import payWithPrompt from "./pay";
import withdrawWithPrompt from "./withdraw";

/*
  Main entry point for LNURL calls
  returns a messagable response: an object with either a `data` or with an `error`
*/
async function lnurl(message: Message | MessageLNURLChannel) {
  console.log("LNURL - HELLO FROm lnurl", message);

  if (typeof message.args.lnurlEncoded !== "string") return;
  let lnurlDetails;
  try {
    lnurlDetails = await lnurlLib.getDetails(message.args.lnurlEncoded);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to parse LNURL" };
  }

  console.log("LNURL - lnurlDetails: ", lnurlDetails);

  switch (lnurlDetails.tag) {
    case "channelRequest":
      if ("public" in message) {
        return channelRequestWithPrompt(message, lnurlDetails);
      } else {
        console.error("Wrong 'message' type: ", message);
        return;
      }

    case "login":
      console.log("LNURL - tag: login");
      // return true;
      return await authWithPrompt(message, lnurlDetails);

    case "payRequest":
      return payWithPrompt(message, lnurlDetails);

    case "withdrawRequest":
      return withdrawWithPrompt(message, lnurlDetails);

    default:
      return { error: "This LNURL is not supported yet" };
  }
}

export default lnurl;
export { authWithPrompt, payWithPrompt, withdrawWithPrompt };
