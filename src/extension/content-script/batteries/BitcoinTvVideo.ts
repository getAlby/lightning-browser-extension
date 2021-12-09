import axios from "axios";

import getOriginData from "../originData";
import setLightningData from "../setLightningData";

const urlMatcher = /^https?:\/\/bitcointv\.com\/w\/.*/i;

const battery = (): void => {
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
  const apiURL = `https://bitcointv.com/api/v1/videos/${id}`;

  axios
    .get<any>(apiURL)
    .then((response) => {
      const data = response.data;
      const channelName = data.channel.displayName;
      const channelDescription = data.channel.description;
      const icon = `https://bitcointv.com${data.channel.avatar.path}`;
      const episodeDescription = data.description;

      // we search in the episode or channel description for lightning data
      const text = `${episodeDescription} ${channelDescription}`;

      let match;
      let recipient;
      // check for an lnurl
      if ((match = text.match(/(lnurlp?:)(\S+)/i))) {
        recipient = match[2];
      }
      // if there is no lnurl we check for a zap emoji with a lightning address
      // we check for the @-sign to try to limit the possibility to match some invalid text (e.g. random emoji usage)
      else if ((match = text.match(/(⚡️:?|lightning:|lnurl:)(\S+@\S+)/i))) {
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

const BitcoinTvVideo = {
  urlMatcher,
  battery,
};
export default BitcoinTvVideo;
