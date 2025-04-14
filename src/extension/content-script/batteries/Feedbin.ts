import axios from "axios";
import type { Battery, BatteryMetaTagRecipient } from "~/types";

import getOriginData from "../originData";
import { setLightningData } from "./helpers";

const urlMatcher = /https:\/\/feedbin\.com/i;

const battery = async (): Promise<void> => {
  let lightningData = null;

  const weburl =
    document.querySelector<HTMLAnchorElement>("#source_link")?.href ?? "";

  if (!weburl) return;

  lightningData = await fetchWebPage(weburl);

  if (lightningData) setLightningData([lightningData]);
};

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

async function fetchWebPage(weburl: string): Promise<Battery | null> {
  const response = await axios.get<Document>(weburl, {
    responseType: "document",
  });

  const name = response.data.querySelector<HTMLMetaElement>(
    'head > meta[property="og:site_name"]'
  )?.content;
  const description = response.data.querySelector<HTMLMetaElement>(
    'head > meta[property="og:description"]'
  )?.content;
  const imageUrl = response.data.querySelector<HTMLMetaElement>(
    'head > meta[property="og:image"]'
  )?.content;

  const monetizationTag = response.data.querySelector<HTMLMetaElement>(
    'head > meta[name="lightning" i]'
  );

  if (!monetizationTag) {
    return null;
  }
  const content = monetizationTag.content;

  let recipient: BatteryMetaTagRecipient;
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

  return {
    ...recipient,
    ...getOriginData(),
    description: description ?? "",
    name: name ?? "",
    icon: imageUrl ?? "",
  };
}

const Feedbin = {
  urlMatcher,
  battery,
};

export default Feedbin;
