const urlMatcher = /^https:\/\/www\.youtube.com\/watch.*/;

const battery = () => {
  const videoDescription = document.querySelector("#description .content");
  const channelLink = document.querySelector(".ytd-channel-name a");
  if (!videoDescription || !channelLink) {
    return Promise.resolve();
  }
  const text = videoDescription.textContent;
  let lnurl;
  // check for an lnurl
  lnurl = text.match(/(lnurlp:)(\S+)/i);
  // if there is no lnurl we check for a zap emoji with a lightning address
  // we check for the @-sign to try to limit the possibility to match some invalid text (e.g. random emoji usage)
  if (!lnurl) {
    lnurl = text.match(/(⚡️:)(\S+@\S+)/i);
  }
  if (!lnurl) {
    Promise.resolve();
  }
  const name = channelLink.textContent;
  const imageUrl = document.querySelector("#meta-contents img").src;
  return Promise.resolve([
    {
      method: "lnurl",
      recipient: lnurl[2],
      name: name,
      icon: imageUrl,
    },
  ]);
};

const YouTubeVideo = {
  urlMatcher,
  battery,
};

export default YouTubeVideo;
