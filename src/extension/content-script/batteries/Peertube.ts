import axios from "axios";

import getOriginData from "../originData";
import setLightningData from "../setLightningData";

interface PeertubeRes {
  channel: {
    displayName: string;
    description: string;
    support: string | null;
    avatar: {
      path: string;
    };
  };
  description: string;
  support: string | null;
}

// add more peertube URLs to this regex
const urlMatcher = /^https?:\/\/(bitcointv\.com|www\.bitcast\.online)\/w\/.*/i;

const battery = (): void => {
  const hostMatch = document.location.toString().match(urlMatcher);
  if (!hostMatch) {
    return;
  }
  const host = hostMatch[1];
  const linkTag = document.querySelector<HTMLLinkElement>(
    'link[rel="canonical"][href*="videos/watch"]'
  );
  if (!linkTag) {
    return;
  }
  const apiMatch = linkTag.href.match(/videos\/watch\/(.+)/);
  if (!apiMatch) {
    return;
  }
  const id = apiMatch[1];
  const apiURL = `https://${host}/api/v1/videos/${id}`;

  axios
    .get<PeertubeRes>(apiURL)
    .then((response) => {
      const data = response.data;
      const channelName = data.channel.displayName;
      const channelDescription = data.channel.description;
      const icon = `https://${host}${data.channel.avatar.path}`;
      const episodeDescription = data.description;
      const support = `${data.support} ${data.channel.support}`;

      // we search in the episode or channel description for lightning data
      const text = `${episodeDescription} ${channelDescription} ${support}`;

      let match;
      let recipient;
      // check for an lnurl
      if ((match = text.match(/(lnurlp?:)(\S+)/i))) {
        recipient = match[2];
      }
      // if there is no lnurl we check for a zap emoji with a lightning address
      // we check for the @-sign to try to limit the possibility to match some invalid text (e.g. random emoji usage)
      else if ((match = text.match(/(⚡️:?|lightning:|lnurl:)\s?(\S+@\S+)/i))) {
        recipient = match[2];
      } else {
        return;
      }
      const metaData = getOriginData();

      setLightningData([
        {
          ...metaData,
          method: "lnurlp",
          recipient: recipient,
          name: channelName,
          icon: icon,
          description: channelDescription,
        },
      ]);
    })
    .catch((e) => {
      console.log("Alby could not load video data", e);
    });
};

const Peertube = {
  urlMatcher,
  battery,
};
export default Peertube;
