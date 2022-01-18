import getOriginData from "../originData";
import setLightningData from "../setLightningData";

const urlMatcher = /^https:\/\/www\.youtube.com\/watch.*/;

const battery = (): void => {
  const videoDescription = document.querySelector(
    "#columns #primary #primary-inner #meta-contents #description .content"
  );
  const channelLink = document.querySelector(
    "#columns #primary #primary-inner #meta-contents .ytd-channel-name a"
  );
  if (!videoDescription || !channelLink) {
    return;
  }
  const text = videoDescription.textContent || "";
  let match;
  let recipient;
  // check for an lnurl
  if ((match = text.match(/(lnurlp:)(\S+)/i))) {
    recipient = match[2];
  }
  // if there is no lnurl we check for a zap emoji with a lightning address
  // we check for the @-sign to try to limit the possibility to match some invalid text (e.g. random emoji usage)
  else if ((match = text.match(/(⚡:?|lightning:|lnurl:)\s?(\S+@\S+)/i))) {
    recipient = match[2];
  } else {
    return;
  }

  const name = channelLink.textContent || "";
  const imageUrl =
    document.querySelector<HTMLImageElement>(
      "#columns #primary #primary-inner #meta-contents img"
    )?.src || "";
  setLightningData([
    {
      method: "lnurl",
      recipient,
      ...getOriginData(),
      name,
      icon: imageUrl,
    },
  ]);
};

const YouTubeVideo = {
  urlMatcher,
  battery,
};

export default YouTubeVideo;
