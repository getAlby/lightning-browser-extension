import ipaddr from "ipaddr.js";
import lnurlLib from "~/common/lib/lnurl";
import { isLNURLDetailsError } from "~/common/utils/typeHelpers";
import type { MessageWebLnLnurl, Sender } from "~/types";

import auth from "./auth";
import authOrPrompt from "./authOrPrompt";
import channelRequestWithPrompt from "./channel";
import payWithPrompt from "./pay";
import withdrawWithPrompt from "./withdraw";

const LOCAL_HOST_SUFFIXES = [".local", ".internal", ".localhost", ".home.arpa"];

/*
  LNURLs passed in by a website are fetched from the background script, which
  holds broad host permissions. A website must not be able to point those
  requests at the user's own machine or local network.
*/
export function isPrivateHost(hostname: string): boolean {
  const host = hostname
    .toLowerCase()
    .replace(/^\[|\]$/g, "")
    .replace(/\.$/, "");
  if (!host || host === "localhost") return true;
  if (LOCAL_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))) return true;
  // process() unwraps IPv4-mapped IPv6 (::ffff:a.b.c.d); everything that is
  // not plain unicast (loopback, private, link-local, CGNAT, NAT64, ...) is
  // treated as private.
  return ipaddr.isValid(host) && ipaddr.process(host).range() !== "unicast";
}

/*
  Main entry point for LNURL calls
  returns a messagable response: an object with either a `data` or with an `error`
*/
async function lnurl(message: MessageWebLnLnurl, sender: Sender) {
  if (typeof message.args.lnurlEncoded !== "string") return;
  let lnurlDetails;
  try {
    const url = lnurlLib.normalizeLnurl(message.args.lnurlEncoded);
    if (isPrivateHost(url.hostname)) {
      return { error: "Invalid LNURL" };
    }

    lnurlDetails = await lnurlLib.getDetails(message.args.lnurlEncoded);
    if (isLNURLDetailsError(lnurlDetails)) {
      return { error: lnurlDetails.reason };
    }

    // the callback is chosen by the LNURL service, so it is checked as well
    if (
      "callback" in lnurlDetails &&
      isPrivateHost(new URL(lnurlDetails.callback).hostname)
    ) {
      return { error: "Invalid LNURL" };
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
