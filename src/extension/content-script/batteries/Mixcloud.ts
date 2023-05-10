import fetchAdapter from "@vespaiach/axios-fetch-adapter";
import axios from "axios";

import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";

const urlMatcher = /^https:\/\/www.mixcloud.com\/([^/]+)(\/)?([^/]+)?(\/)?$/;

function battery(): void {
  const urlParts = document.location.pathname.split("/");
  const username = urlParts[1];
  const showName = urlParts[2];

  if (username && !showName) {
    handleProfilePage(username);
  } else if (showName) {
    handleShowPage(username);
  }
}

async function handleShowPage(username: string) {
  const descriptionElement = document.querySelector<HTMLMetaElement>(
    'head > meta[property="og:description"]'
  );
  const imageUrl = document.querySelector<HTMLMetaElement>(
    'head > meta[property="og:image"]'
  )?.content;
  if (!descriptionElement) return;

  const address = findLightningAddressInText(descriptionElement.content);

  if (!address) {
    handleProfilePage(username);
    return;
  }

  setLightningData([
    {
      method: "lnurl",
      address: address,
      ...getOriginData(),
      description: descriptionElement.content ?? "",
      name: document.title.split(" | Mixcloud")[0] ?? "",
      icon: imageUrl ?? "",
    },
  ]);
}

async function handleProfilePage(username: string) {
  const userResponse = await axios.get(`https://api.mixcloud.com/${username}`, {
    adapter: fetchAdapter,
  });
  if (!userResponse) return;
  const userInfo = await userResponse.data;

  const address = findLightningAddressInText(userInfo.biog);

  if (!address) return;

  setLightningData([
    {
      method: "lnurl",
      address: address,
      ...getOriginData(),
      description: userInfo.biog,
      name: userInfo.name ?? "",
      icon: userInfo.pictures.medium ?? "",
    },
  ]);
}

const mixcloud = {
  urlMatcher,
  battery,
};
export default mixcloud;
