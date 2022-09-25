import axios from "axios";

import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";

const urlMatcher = /^https:\/\/www\.youtube.com\/(channel|c)\/([^/]+).*/;

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
        padding: 0px 10px;
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
    const followButton = document.querySelector("#subscribe-button");
    followButton?.parentElement?.insertBefore(sendSatsButton, followButton);
  }
};

const battery = async (): Promise<void> => {
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

  if (!lnurl) return;

  createAlbyButton(lnurl);

  setLightningData([
    {
      method: "lnurl",
      address: lnurl,
      ...getOriginData(),
      name: name,
      description: "", // we can not reliably find a description (the meta tag might be of a different video)
      icon: imageUrl,
    },
  ]);
};

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

const YouTubeChannel = {
  urlMatcher,
  battery,
};

export { findLnurlFromYouTubeAboutPage };
export default YouTubeChannel;
