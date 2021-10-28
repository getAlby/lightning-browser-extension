import axios from "axios";

import getOriginData from "../originData";
import { Battery } from "../../../types";

interface Podcast {
  feed: {
    image: string;
    value: {
      model: {
        type: string;
        method: string;
      };
      destinations: Destination[];
    };
  };
}

interface Destination {
  address: string;
  name: string;
}

const urlMatcher = /^https:\/\/podcastindex\.org\/podcast\/(\d+).*/;

const battery = (): Promise<Battery[] | void> => {
  let feedId;
  let match;
  if ((match = document.location.toString().match(urlMatcher))) {
    feedId = match[1];
  }
  if (!feedId) return Promise.resolve();
  return axios
    .get<Podcast>(`https://podcastindex.org/api/podcasts/byfeedid?id=${feedId}`)
    .then((response) => {
      const feed = response.data.feed;
      if (!feed.value || feed.value.model.type !== "lightning") {
        return;
      }
      const method = feed.value.model.method;
      return feed.value.destinations.map((destination) => {
        return {
          method,
          recipient: destination.address,
          ...getOriginData(),
          name: destination.name,
          icon: feed.image,
        };
      });
    });
};

const Podcastindex = {
  urlMatcher,
  battery,
};

export default Podcastindex;
