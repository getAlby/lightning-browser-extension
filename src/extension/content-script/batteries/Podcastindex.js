import axios from "axios";

const urlMatcher = /^https:\/\/podcastindex\.org\/podcast\/(\d+).*/;

const battery = () => {
  const matchData = document.location.toString().match(urlMatcher);
  const feedId = matchData[1];
  return axios
    .get(`https://podcastindex.org/api/podcasts/byfeedid?id=${feedId}`)
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
          name: destination.name,
        };
      });
    });
};

const Podcastindex = {
  urlMatcher,
  battery,
};

export default Podcastindex;
