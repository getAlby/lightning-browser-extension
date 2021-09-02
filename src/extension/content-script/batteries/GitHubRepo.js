import axios from "axios";

const urlMatcher = /^https:\/\/github.com\/([^/]+)\/([^/]+)\/*/;

const battery = () => {
  const matchData = document.location.toString().match(urlMatcher);
  const username = matchData[1];
  const repo = matchData[2];
  const lndonateUrl = `https://raw.githubusercontent.com/${username}/${repo}/master/.lndonate`;
  return axios
    .get(lndonateUrl, { responseType: "text" })
    .then((response) => {
      const data = response.data.split("=");
      const method = data[0];
      if (method !== "lnurlp") {
        return;
      }
      const recipient = data[1];
      return [
        {
          method,
          recipient,
          name: `${username}/${repo}`,
        },
      ];
    })
    .catch((e) => {
      console.log(e);
      // Ignoring errors
      return null;
    });
};

const GitHubRepo = {
  urlMatcher,
  battery,
};

export default GitHubRepo;
