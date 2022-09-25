import getOriginData from "../originData";
import { findLnurlFromYouTubeAboutPage } from "./YouTubeChannel";
import { findLightningAddressInText, setLightningData } from "./helpers";

const urlMatcher = /^https:\/\/www\.youtube.com\/watch.*/;

const createAlbyButton = (lnurl: string) => {
  if (!document.querySelector<HTMLLinkElement>(".alby-send-sats")) {
    const sendSatsButton = document.createElement("a");
    sendSatsButton.href = `lightning:${lnurl}`;
    sendSatsButton.innerText = "⚡ Send Satoshis ⚡";
    sendSatsButton.setAttribute("class", "alby-send-sats");
    sendSatsButton.setAttribute(
      "style",
      `
        color: white;
        background-color: orange;
        padding: 10px;
        border-radius: 2px;
        text-decoration: none;
        margin: 0 5px;
        font-size: 1.4rem;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        line-height: 36px;
        cursor: pointer;
      `
    );

    // can't insert before to their shadowy element
    const metaContents = document.querySelector("#meta-contents");
    metaContents?.prepend(sendSatsButton);
  }
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
