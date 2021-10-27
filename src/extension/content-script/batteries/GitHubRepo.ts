import axios, { AxiosResponse } from "axios";

import getOriginData from "../originData";
import { Battery } from "../../../types";

const urlMatcher = /^https:\/\/github.com\/([^/]+)\/([^/]+)\/*/;

const battery = (): Promise<[Battery] | void> => {
  const matchData = document.location.toString().match(urlMatcher);
  if (!matchData) return Promise.resolve();
  const username = matchData[1];
  const repo = matchData[2];
  const lndonateUrl = `https://raw.githubusercontent.com/${username}/${repo}/master/.lndonate`;
  return axios
    .get(lndonateUrl, { responseType: "text" })
    .then((response: AxiosResponse<any>) => {
      return [
        {
          method: "lnurl",
          recipient: response.data,
          ...getOriginData(),
          name: `${username}/${repo}`,
          icon: "",
        },
      ];
    });
};

const GitHubRepo = {
  urlMatcher,
  battery,
};

export default GitHubRepo;
