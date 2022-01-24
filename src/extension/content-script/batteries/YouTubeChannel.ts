import axios from "axios";

import getOriginData from "../originData";
import setLightningData from "../setLightningData";

const urlMatcher = /^https:\/\/www\.youtube.com\/(channel|c)\/([^/]+).*/;

const battery = (): void => {
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

  axios
    .get<Document>(`https://www.youtube.com/${match[1]}/${match[2]}/about`, {
      responseType: "document",
    })
    .then((response) => {
      // TODO extract from links?
      const descriptionElement: HTMLMetaElement | null =
        response.data.querySelector('meta[itemprop="description"]');

      if (!descriptionElement) {
        return;
      }
      const lnurl = descriptionElement.content.match(
        /(⚡:?|lightning:|lnurl:)\s?(\S+@\S+)/i
      );
      if (lnurl) {
        setLightningData([
          {
            method: "lnurl",
            recipient: lnurl[2],
            ...getOriginData(),
            name: name,
            icon: imageUrl,
          },
        ]);
      }
    });
};

const YouTubeChannel = {
  urlMatcher,
  battery,
};

export default YouTubeChannel;
