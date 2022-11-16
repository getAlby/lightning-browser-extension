import getOriginData from "../originData";
import { findLnurlFromYouTubeAboutPage } from "./YouTubeChannel";
import { findLightningAddressInText, setLightningData } from "./helpers";

declare global {
  interface Window {
    LBE_YT_MUTATION_OBSERVER: MutationObserver;
  }
}

const urlMatcher = /^https:\/\/www\.youtube.com\/watch.*/;

function getTextMatch() {
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

  return { text, channelLink };
}

const battery = async (): Promise<void> => {
  // Twitter loads everything async...so we observe DOM changes to check if data finished loading.
  async function ytDOMChanged(_: MutationRecord[], observer: MutationObserver) {
    const { text, channelLink } = getTextMatch();
    if (text || channelLink) {
      observer.disconnect();

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
        const match = channelLink?.href.match(
          /^https:\/\/www\.youtube.com\/(channel|c)\/([^/]+).*/
        );
        if (match) {
          lnurl = await findLnurlFromYouTubeAboutPage(match[1], match[2]);
        }
      }

      if (!lnurl) return;

      const name = channelLink?.textContent || "";
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
          description: "", // we can not reliably find a description (the meta tag might be of a different video)
          icon: imageUrl,
        },
      ]);
    }
  }

  if (!window.LBE_YT_MUTATION_OBSERVER) {
    window.LBE_YT_MUTATION_OBSERVER = new MutationObserver(ytDOMChanged);
  }
  window.LBE_YT_MUTATION_OBSERVER.observe(document, {
    childList: true,
    subtree: true,
  });
  // On slow connections the observer is added after the DOM is fully loaded.
  // Therefore the callback ytDOMChanged needs to also be called manually.
  ytDOMChanged([], window.LBE_YT_MUTATION_OBSERVER);
};

const YouTubeVideo = {
  urlMatcher,
  battery,
};

export default YouTubeVideo;
