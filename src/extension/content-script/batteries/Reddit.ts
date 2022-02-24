import getOriginData from "../originData";
import setLightningData from "../setLightningData";

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
  let match;
  let recipient;
  // attempt to extract lnurlp: from the description text
  if ((match = (descriptionElement.content || "").match(/lnurlp:(\S+)/i))) {
    recipient = match[1];
  } else if (
    (match = descriptionElement.content.match(
      /(⚡:?|lightning:|lnurl:)\s?(\S+@\S+)/i
    ))
  ) {
    recipient = match[2];
  }
  // if we still did not find anything ignore it.
  if (!recipient) {
    return;
  }

  setLightningData([
    {
      method: "lnurl",
      recipient,
      ...getOriginData(),
      icon: imageUrl,
      name: document.title,
    },
  ]);
}

const reddit = {
  urlMatcher,
  battery,
};
export default reddit;
