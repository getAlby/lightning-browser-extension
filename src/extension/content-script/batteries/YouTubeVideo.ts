import { Battery } from "../../../types";

const urlMatcher = /^https:\/\/www\.youtube.com\/watch.*/;

const battery = (): Promise<[Battery] | void> => {
  const videoDescription = document.querySelector("#description .content");
  const channelLink = document.querySelector(".ytd-channel-name a");
  if (!videoDescription || !channelLink) {
    return Promise.resolve();
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
  else if ((match = text.match(/(⚡️:)(\S+@\S+)/i))) {
    recipient = match[2];
  } else {
    return Promise.resolve();
  }

  const name = channelLink.textContent || "";
  const imageUrl =
    document.querySelector<HTMLImageElement>("#meta-contents img")?.src || "";
  return Promise.resolve([
    {
      method: "lnurl",
      recipient,
      host: window.location.host,
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
