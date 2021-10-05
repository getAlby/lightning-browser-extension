import axios from "axios";

const urlMatcher = /^https:\/\/www\.youtube.com\/(channel|c)\/([^/]+).*/;

const battery = () => {
  const matchData = document.location.toString().match(urlMatcher);
  const name = document.querySelector(
    "#inner-header-container yt-formatted-string.ytd-channel-name"
  ).textContent;
  const imageUrl = document.querySelector(
    "#channel-header-container yt-img-shadow img"
  ).src;

  return axios
    .get(`https://www.youtube.com/${matchData[1]}/${matchData[2]}/about`, {
      responseType: "document",
    })
    .then((response) => {
      // TODO extract from links?
      const descriptionElement = response.data.querySelector(
        'meta[name="description"]'
      );
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
