import getOriginData from "../originData";
import { findLnurlFromYouTubeAboutPage } from "./YouTubeChannel";
import { findLightningAddressInText, setLightningData } from "./helpers";

const urlMatcher = /^https:\/\/www\.youtube.com\/watch.*/;

const createAlbyButton = (lnurl: string) => {
  console.log("createAlbyButton: YOUTUBE CHANNEL event");

  const anchorEl = document.createElement("a");
  anchorEl.setAttribute("href", "lightning:monvol@getalby.com");
  anchorEl.innerHTML = `Use Alby to tip: ${lnurl}`;

  const closeEl = document.createElement("a");
  closeEl.innerHTML = "X";
  closeEl.addEventListener(
    "click",
    (event) => event?.target?.parentNode.remove(),
    false
  );
  closeEl.setAttribute(
    "style",
    `
    position: absolute;
    top: -5%;
    right: -5%;
    border: 2px solid blue;
    background: aqua;
    padding: 2px;
    `
  );

  const injectElement = document.createElement("div");
  injectElement.appendChild(anchorEl);
  injectElement.appendChild(closeEl);
  injectElement.className = "alby--youtube--battery";
  injectElement.setAttribute(
    "style",
    `
    position: fixed;
    right: 5%;
    bottom: 5%;
    border: 5px solid pink;
    z-index: 9999;
    background: deeppink;
    padding: 10px;
    `
  );

  document.body.appendChild(injectElement);
};

const battery = async (): Promise<void> => {
  let text = "";
  document
    .querySelectorAll(
      "#columns #primary #primary-inner #meta-contents #description .content"
    )
    .forEach((e) => {
      text += ` ${e.textContent}`;
    });
  const channelLink = document.querySelector<HTMLAnchorElement>(
    "#columns #primary #primary-inner #meta-contents .ytd-channel-name a"
  );
  if (!text || !channelLink) {
    return;
  }
  let match;
  let lnurl;
  // check for an lnurl
  if ((match = text.match(/(lnurlp:)(\S+)/i))) {
    lnurl = match[2];
  }
  // if there is no lnurl we check for a zap emoji with a lightning address
  // we check for the @-sign to try to limit the possibility to match some invalid text (e.g. random emoji usage)
  else if ((match = findLightningAddressInText(text))) {
    lnurl = match;
  } else {
    // load the about page to check for a lightning address
    const match = channelLink.href.match(
      /^https:\/\/www\.youtube.com\/(channel|c)\/([^/]+).*/
    );
    if (match) {
      lnurl = await findLnurlFromYouTubeAboutPage(match[1], match[2]);
    }
  }

  if (!lnurl) return;

  createAlbyButton(lnurl);

  const name = channelLink.textContent || "";
  const imageUrl =
    document.querySelector<HTMLImageElement>(
      "#columns #primary #primary-inner #meta-contents img"
    )?.src || "";
  setLightningData([
    {
      method: "lnurl",
      address: lnurl,
      ...getOriginData(),
      name,
      description: "", // we can not reliably find a description (the meta tag might be of a different video)
      icon: imageUrl,
    },
  ]);
};

const YouTubeVideo = {
  urlMatcher,
  battery,
};

export default YouTubeVideo;
