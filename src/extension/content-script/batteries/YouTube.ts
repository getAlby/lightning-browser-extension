import axios from "axios";
import _ from "lodash";

import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";
import updateBoostButton from "./inpage-components/boost-button";

declare global {
  interface Window {
    LBE_MUTATION_OBSERVER: MutationObserver;
  }
}

const urlMatcher = /^https:\/\/www\.youtube.com\/.*/;
const channelUrlMatcher = /^https:\/\/www\.youtube.com\/(channel|c)\/([^/]+).*/;
const battery = async (): Promise<void> => {
  if (!window.LBE_MUTATION_OBSERVER) {
    window.LBE_MUTATION_OBSERVER = new MutationObserver(
      _.debounce(youtubeDOMChanged, 500)
    );
  }

  window.LBE_MUTATION_OBSERVER.observe(document, {
    childList: true,
    subtree: true,
  });

  // On slow connections the observer is added after the DOM is fully loaded.
  // Therefore the callback twitterDOMChanged needs to also be called manually.
  youtubeDOMChanged();
};

const YouTubeVideo = {
  urlMatcher,
  battery,
};

export default YouTubeVideo;

async function youtubeDOMChanged() {
  let info = await getVideoInfo();
  if (!info) {
    info = await getChannelInfo();
  }

  updateBoostButton(info);

  if (!info?.lnurl) {
    return;
  }

  setLightningData([
    {
      method: "lnurl",
      address: info.lnurl,
      ...getOriginData(),
      name: info?.name ?? "",
      description: "", // we can not reliably find a description (the meta tag might be of a different video)
      icon: info.image ?? "",
    },
  ]);
}

async function getVideoInfo(): Promise<PublisherInfo | null> {
  if (
    !document.location.toString().match(/^https:\/\/www\.youtube.com\/watch.*/)
  ) {
    return null;
  }

  let text = "";
  document
    .querySelectorAll(
      "ytd-watch-flexy:not([hidden]) #columns #primary #primary-inner #meta-contents #description .content"
    )
    .forEach((e) => {
      text += ` ${e.textContent}`;
    });
  const channelLink = document.querySelector<HTMLAnchorElement>(
    "#columns #primary #primary-inner #meta-contents .ytd-channel-name a"
  );
  if (!text || !channelLink) {
    return null;
  }
  let match;
  let lnurl = "";
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
      const lnurlResult = await findLnurlFromYouTubeAboutPage(
        match[1],
        match[2]
      );
      if (lnurlResult) {
        lnurl = lnurlResult;
      }
    }
  }

  const image =
    document.querySelector<HTMLImageElement>(
      "#columns #primary #primary-inner #meta-contents img"
    )?.src ||
    document.querySelector<HTMLImageElement>(
      "#columns #primary #primary-inner #owner #avatar img" // support maybe new UI being rolled out 2022/09
    )?.src ||
    "";

  return { lnurl, name: channelLink.textContent ?? undefined, image };
}

async function getChannelInfo(): Promise<PublisherInfo | null> {
  const match = document.location.toString().match(channelUrlMatcher);
  if (!match) {
    return null;
  }

  const name =
    document.querySelector(
      "#inner-header-container yt-formatted-string.ytd-channel-name"
    )?.textContent || "";
  const image =
    document.querySelector<HTMLImageElement>(
      "#channel-header-container yt-img-shadow#avatar img"
    )?.src || "";

  let lnurl;

  const headerLink = document.querySelector<HTMLAnchorElement>(
    "#channel-header #primary-links a[href*='getalby.com']"
  );
  // check either for an alby link in the header or
  // check in the channel about page
  if (headerLink) {
    lnurl = findLnurlFromHeaderLink(headerLink);
  } else {
    lnurl = await findLnurlFromYouTubeAboutPage(match[1], match[2]);
  }

  if (!lnurl) return null;

  return {
    lnurl,
    name,
    image,
  };
}

const findLnurlFromHeaderLink = (
  headerLink: HTMLAnchorElement
): string | null => {
  const url = new URL(headerLink.href);
  const text = url.searchParams.get("q") + " ";
  return findLightningAddressInText(text);
};

const findLnurlFromYouTubeAboutPage = (
  path: string,
  name: string
): Promise<string | null> => {
  return axios
    .get<Document>(`https://www.youtube.com/${path}/${name}/about`, {
      responseType: "document",
    })
    .then((response) => {
      let lnurl;

      const headerLink = response.data.querySelector<HTMLAnchorElement>(
        "#channel-header #primary-links a[href*='getalby.com']"
      );
      if (headerLink) {
        lnurl = findLnurlFromHeaderLink(headerLink);
        if (lnurl) return lnurl;
      }

      const descriptionElement: HTMLMetaElement | null =
        response.data.querySelector('meta[itemprop="description"]');

      if (!descriptionElement) {
        return null;
      }
      lnurl = findLightningAddressInText(descriptionElement.content);
      return lnurl;
    })
    .catch((e) => {
      console.error(e);
      return null;
    });
};

export class PublisherInfo {
  lnurl?: string;
  image?: string;
  name?: string;
}
