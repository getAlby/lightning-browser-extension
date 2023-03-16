import axios from "axios";
import { Battery } from "~/types";

import getOriginData from "../originData";
import { findLightningAddressInText } from "./helpers";

const urlMatcher =
  /^https:\/\/www\.youtube.com\/(((channel|c)\/([^/]+))|(@[^/]+)).*/;

const battery = async (): Promise<Battery | void> => {
  const match = document.location.toString().match(urlMatcher);
  if (!match) {
    return;
  }
  const name =
    document.querySelector(
      "#inner-header-container yt-formatted-string.ytd-channel-name"
    )?.textContent || "";
  const imageUrl =
    document.querySelector<HTMLImageElement>(
      "#channel-header-container yt-img-shadow#avatar img"
    )?.src || "";

  let lnurl;
  const contentUri = match[0];

  const headerLink = document.querySelector<HTMLAnchorElement>(
    "#channel-header #primary-links a[href*='getalby.com']"
  );
  // check either for an alby link in the header or
  // check in the channel about page
  if (headerLink) {
    lnurl = findLnurlFromHeaderLink(headerLink);
  } else {
    lnurl = await findLnurlFromYouTubeAboutPage(match[1]);
  }

  if (!lnurl) return;

  return {
    method: "lnurl",
    address: lnurl,
    ...getOriginData(),
    name: name,
    description: "", // we can not reliably find a description (the meta tag might be of a different video)
    icon: imageUrl,
    contentUri: contentUri,
  };
};

const findLnurlFromHeaderLink = (
  headerLink: HTMLAnchorElement
): string | null => {
  const url = new URL(headerLink.href);
  const text = url.searchParams.get("q") + " ";
  return findLightningAddressInText(text);
};

const findLnurlFromYouTubeAboutPage = (
  path: string
): Promise<string | null> => {
  return axios
    .get<Document>(`https://www.youtube.com/${path}/about`, {
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

const YouTubeChannel = {
  urlMatcher,
  battery,
};

export { findLnurlFromYouTubeAboutPage };
export default YouTubeChannel;
