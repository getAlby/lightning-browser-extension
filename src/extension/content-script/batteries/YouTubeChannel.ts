import axios, { AxiosResponse } from "axios";

import getOriginData from "../originData";
import { Battery } from "../../../types";

const urlMatcher = /^https:\/\/www\.youtube.com\/(channel|c)\/([^/]+).*/;

const battery = (): Promise<[Battery] | void> => {
  let match = document.location.toString().match(urlMatcher);
  if (!match) {
    return Promise.resolve();
  }
  const name =
    document.querySelector(
      "#inner-header-container yt-formatted-string.ytd-channel-name"
    )?.textContent || "";
  const imageUrl =
    document.querySelector<HTMLImageElement>(
      "#channel-header-container yt-img-shadow img"
    )?.src || "";

  return axios
    .get(`https://www.youtube.com/${match[1]}/${match[2]}/about`, {
      responseType: "document",
    })
    .then((response: AxiosResponse<any>) => {
      // TODO extract from links?
      const descriptionElement: HTMLMetaElement | null =
        response.data.querySelector('meta[name="description"]');
      if (!descriptionElement) {
        return;
      }
      const lnurl = descriptionElement.content.match(
        /(lnurlp|lightning):(\S+)/i
      );
      if (lnurl) {
        return [
          {
            method: "lnurl",
            recipient: lnurl[2],
            ...getOriginData(),
            name: name,
            icon: imageUrl,
          },
        ];
      }
    });
};

const YouTubeChannel = {
  urlMatcher,
  battery,
};

export default YouTubeChannel;
