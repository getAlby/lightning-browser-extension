import getOriginData from "../originData";
import { findLnurlFromYouTubeAboutPage } from "./YouTubeChannel";
import {
  findLightningAddressInText,
  resetLightningData,
  setLightningData,
} from "./helpers";

declare global {
  interface Window {
    ALBY_BATTERY: boolean;
  }
}

const urlMatcher = /^https:\/\/www\.youtube.com\/watch.*/;

let oldVideoId: string;
let observer: MutationObserver | null = null;

const setData = async (): Promise<void> => {
  const searchParams = new URLSearchParams(window.location.search);
  const videoId = searchParams.get("v");

  // to keep the battery info stable after the description settles
  // youtube returns old lightning data even when switching on new video for few initial seconds. so we just return from here instead of showing old lightning data
  if (videoId === oldVideoId) {
    return;
  }

  oldVideoId = videoId as string;

  let text = "";
  document
    .querySelectorAll(
      "ytd-watch-metadata #above-the-fold #bottom-row #description #description-inner #description-inline-expander yt-attributed-string .yt-core-attributed-string"
    )
    .forEach((e) => {
      text += `${e.textContent} `;
    });

  const channelLink = document.querySelector<HTMLAnchorElement>(
    "ytd-watch-metadata #above-the-fold #top-row #owner #upload-info .ytd-channel-name yt-formatted-string a"
  );

  if (!channelLink) {
    resetLightningData();
    return;
  }

  let match;
  let lnurl;

  // Check for an lnurl
  if ((match = text.match(/(lnurlp:)(\S+)/i))) {
    lnurl = match[2];
  }
  // If no lnurl, check for a zap emoji with a lightning address
  else if ((match = findLightningAddressInText(text))) {
    lnurl = match;
  }
  // Load the about page to check for a lightning address
  else {
    const match = channelLink.href.match(
      /^https:\/\/www\.youtube.com\/(((channel|c)\/([^/]+))|(@[^/]+)).*/
    );
    if (match) {
      lnurl = await findLnurlFromYouTubeAboutPage(match[1]);
    }
  }

  if (!lnurl) {
    resetLightningData();
    return;
  }

  const name = channelLink.textContent || "";
  const imageUrl =
    document.querySelector<HTMLImageElement>(
      "#columns #primary #primary-inner #meta-contents img"
    )?.src ||
    document.querySelector<HTMLImageElement>(
      "#columns #primary #primary-inner #owner #avatar img" // support maybe new UI being rolled out 2022/09
    )?.src ||
    "";

  setLightningData([
    {
      method: "lnurl",
      address: lnurl,
      ...getOriginData(),
      name,
      description: "", // We cannot reliably find a description (the meta tag might be of a different video)
      icon: imageUrl,
    },
  ]);
};

const battery = (): void => {
  function waitForChannelLinkAndDescription() {
    const description = document.querySelector(
      "ytd-watch-metadata #above-the-fold #bottom-row #description #description-inner #description-inline-expander yt-attributed-string .yt-core-attributed-string"
    );

    const channelLink = document.querySelector<HTMLAnchorElement>(
      "ytd-watch-metadata #above-the-fold #top-row #owner #upload-info .ytd-channel-name yt-formatted-string a"
    );

    // Ensure all elements are present before proceeding
    if (description && channelLink) {
      clearInterval(descriptionInterval); // Stop checking for the elements

      // run this only once, during the first load
      if (!window.ALBY_BATTERY) {
        window.ALBY_BATTERY = true;

        // we need to run setData if this is the first time the user is
        // visiting youtube as the observer doesn't run intially on attach
        setData();

        // Re-initialize the observer
        observer = new MutationObserver(() => {
          setData();
        });

        // Observe changes in the description (without subtree it didn't work properly)
        observer.observe(description, { childList: true, subtree: true });
        // Observe changes in the channelLink
        observer.observe(channelLink, { childList: true, subtree: true });
      }
    }
  }

  // Wait for the channel link and description to load before initializing the observer and fetching the data
  const descriptionInterval = setInterval(
    waitForChannelLinkAndDescription,
    100
  );
  setTimeout(() => clearInterval(descriptionInterval), 2000);
};

const YouTubeVideo = {
  urlMatcher,
  battery,
};

export default YouTubeVideo;
