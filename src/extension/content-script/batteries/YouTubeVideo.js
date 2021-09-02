import axios from "axios";

const urlMatcher = /^https:\/\/www\.youtube.com\/watch.*/;

const battery = () => {
  const channelLink = document.querySelector(".ytd-channel-name a");
  if (!channelLink) {
    return;
  }
  const name = channelLink.textContent;
  const imageUrl = document.querySelector("#meta-contents img").src;
  return axios
    .get(`${channelLink.href}/about`, { responseType: "document" })
    .then((response) => {
      const descriptionElement = response.data.querySelector(
        'meta[name="description"]'
      );
      console.log(descriptionElement);
      if (!descriptionElement) {
        return;
      }
      const lnurl = descriptionElement.content.match(/lnurlp:(\S+)/i);
      if (lnurl) {
        return [
          {
            method: "lnurl",
            recipient: lnurl[1],
            name: name,
            iconUrl: imageUrl,
          },
        ];
      }
    });
};

const YouTubeVideo = {
  urlMatcher,
  battery,
};

export default YouTubeVideo;
