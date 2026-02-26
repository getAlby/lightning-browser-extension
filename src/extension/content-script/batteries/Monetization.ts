import { BatteryMetaTagRecipient } from "~/types";

import getOriginData from "../originData";
import { isPubKey, setLightningData } from "./helpers";

const urlMatcher = /^https?:\/\/.*/i;

const parseRecipient = (content: string): BatteryMetaTagRecipient => {
  const tokens = content
    .split(";")
    .map((e) => e.trim())
    .filter((e) => !!e);

  const recipient = tokens.reduce((obj, tkn) => {
    const eqIdx = tkn.indexOf("=");
    if (eqIdx === -1) return obj;
    const key = tkn.slice(0, eqIdx).trim();
    const value = tkn.slice(eqIdx + 1).trim();
    return { ...obj, [key]: value };
  }, {} as BatteryMetaTagRecipient);

  return recipient;
};

const battery = (): void => {
  const monetizationTag = document.querySelector<HTMLMetaElement>(
    'head > meta[name="lightning" i]'
  );
  if (!monetizationTag) {
    return;
  }

  // Trim whitespace for robustness
  const content = monetizationTag.content.trim();

  let recipient: BatteryMetaTagRecipient;

  if (content.match(/^lnurlp:/i) || content.indexOf("=") === -1) {
    // Backwards-compatible: direct lightning address, lnurlp:xxx, OR a bare pubkey
    const address = content.replace(/^lnurlp:/i, "");
    if (isPubKey(address)) {
      // Bare node pubkey → keysend
      recipient = {
        method: "keysend",
        address,
      };
    } else {
      // Lightning address or LNURL → lnurl pay flow
      recipient = {
        method: "lnurl",
        address,
      };
    }
  } else {
    // Key=value format — parse and trust the method field if present
    recipient = parseRecipient(content);
    // If no method was specified but address looks like a pubkey, default to keysend
    if (!recipient.method && recipient.address && isPubKey(recipient.address)) {
      recipient = { ...recipient, method: "keysend" };
    }
  }

  const metaData = getOriginData();

  setLightningData([
    {
      ...recipient,
      ...metaData,
    },
  ]);
};

const Monetization = {
  urlMatcher,
  battery,
};
export default Monetization;
