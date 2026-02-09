import { BatteryMetaTagRecipient } from "~/types";

import getOriginData from "../originData";
import { setLightningData } from "./helpers";

const urlMatcher = /^https?:\/\/.*/i;

// Matches compressed (66 hex) or uncompressed (130 hex) public keys
const isPubKey = (str: string): boolean =>
  /^(02|03)[0-9a-f]{64}$/i.test(str) || /^04[0-9a-f]{128}$/i.test(str);

const parseRecipient = (content: string): BatteryMetaTagRecipient => {
  const tokens = content
    .split(";")
    .map((e) => e.trim())
    .filter((e) => !!e);

  const recipient = tokens.reduce((obj, tkn) => {
    const keyAndValue = tkn.split("=");
    const keyAndValueTrimmed = keyAndValue.map((e) => e.trim());
    return { ...obj, [keyAndValueTrimmed[0]]: keyAndValueTrimmed[1] };
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
  const content = monetizationTag.content.trim();

  let recipient: BatteryMetaTagRecipient;

  if (isPubKey(content)) {
    // Direct node pubkey — use keysend
    recipient = {
      method: "keysend",
      address: content,
    };
  } else if (content.match(/^lnurlp:/i) || content.indexOf("=") === -1) {
    // Backwards compatibility: lightning address or lnurlp:xxx
    const lnAddress = content.replace(/lnurlp:/i, "");
    recipient = {
      method: "lnurl",
      address: lnAddress,
    };
  } else {
    // Key=value format: method=keysend;address=02xxx;customKey=xxx;customValue=xxx
    // or method=lnurl;address=xxx
    recipient = parseRecipient(content);
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
