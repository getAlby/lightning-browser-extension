import { Battery } from "~/types";

import getOriginData from "../originData";
import setLightningData from "../setLightningData";

const urlMatcher = /^https?:\/\/.*/i;

const parseRecipient = (content: string): Battery => {
  const tokens = content
    .split(";")
    .map((e) => e.trim())
    .filter((e) => !!e);
  const obj = {};
  tokens.forEach((t) => {
    const kv = t.split("=").map((e) => e.trim());
    obj[kv[0]] = kv[1];
  });
  return obj as Battery;
};

const battery = (): void => {
  const monetizationTag = document.querySelector<HTMLMetaElement>(
    'head > meta[name="lightning"]'
  );
  if (!monetizationTag) {
    return;
  }
  const content = monetizationTag.content;

  let recipient;
  // check for backwards compatibility: supports directly a lightning address or lnurlp:xxx
  if (content.match(/^lnurlp:/) || content.indexOf("=") === -1) {
    const lnAddress = monetizationTag.content.replace(/lnurlp:/i, "");
    recipient = {
      method: "lnurl",
      address: lnAddress,
    };
  } else {
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
