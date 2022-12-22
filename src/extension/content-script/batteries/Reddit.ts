import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";

const urlMatcher = /^https:\/\/www.reddit\.com\/user\/(\w+).*/;

function battery(): void {
  const descriptionElement = document.querySelector<HTMLMetaElement>(
    'head > meta[name="description"]'
  );
  const imageUrl = document.querySelector<HTMLMetaElement>(
    'head > meta[property="og:image"]'
  )?.content;

  if (!descriptionElement || !imageUrl) {
    return;
  }

  const content = descriptionElement.content.split(/:(.*)/s);
  const userName = content[0];
  const description =
    document.querySelector<HTMLMetaElement>(
      `h4 + a[href*='user/${userName.split("/")[1]}'] + div`
    )?.textContent ?? content[1].slice(1);

  let match;
  let recipient;
  // attempt to extract lnurlp: from the description text
  if ((match = (description || "").match(/lnurlp:(\S+)/i))) {
    recipient = match[1];
  } else if ((match = findLightningAddressInText(description))) {
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
      description,
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
