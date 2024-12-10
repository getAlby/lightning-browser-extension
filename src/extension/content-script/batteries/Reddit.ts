import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";

const urlMatcher = /^https:\/\/www.reddit\.com\/user\/(\w+).*/;

function battery(): void {
  const descriptionElement = document.querySelector<HTMLElement>(
    'p[data-testid="profile-description"]'
  );

  const imageUrl = document.querySelector<HTMLImageElement>(
    'img[data-testid="profile-icon"]'
  )?.src;

  if (!descriptionElement || !imageUrl) {
    return;
  }

  const content = descriptionElement.textContent || "";
  const userName =
    document.querySelector("aside div h2")?.textContent?.trim() || "";

  let match;
  let recipient;
  // attempt to extract lnurlp: from the description text
  if ((match = (content || "").match(/lnurlp:(\S+)/i))) {
    recipient = match[1];
  } else if ((match = findLightningAddressInText(content || ""))) {
    recipient = match;
  }
  // if we still did not find anything ignore it.
  if (!recipient) {
    return;
  }

  setLightningData([
    {
      method: "lnurl",
      address: recipient,
      ...getOriginData(),
      description: content,
      icon: imageUrl,
      name: userName,
    },
  ]);
}

const reddit = {
  urlMatcher,
  battery,
};
export default reddit;
