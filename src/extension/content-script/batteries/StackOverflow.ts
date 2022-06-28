import { Battery } from "~/types";

import getOriginData from "../originData";
import setLightningData from "../setLightningData";

const urlMatcher =
  /^https:\/\/stackoverflow\.com\/(users|questions)\/(\d+)\/(\w+).*/;

const battery = async (): Promise<void> => {
  const urlParts = document.location.pathname.split("/");
  const route = urlParts[1];
  const userOrQuestionId = urlParts[2];
  let lightningData = null;

  if (route === "users") {
    lightningData = await handleProfilePage(userOrQuestionId);
  }

  if (lightningData) setLightningData([lightningData]);
};

function findLightningAddressInText(text: string) {
  const match = text.match(/(⚡:?|lightning:|lnurl:)\s?(\S+@[\w-.]+)/i);
  if (match) return match[2];
}

function htmlToText(html: string) {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent;
}

async function handleProfilePage(userId: string): Promise<Battery | null> {
  const userProfile = await fetch(
    // The filter can be generated here: https://api.stackexchange.com/docs/users-by-ids
    `https://api.stackexchange.com/2.2/users/${userId}?site=stackoverflow&filter=!-B3yqvQ2YYGK1t-Hg_ydU`
  ).then((res) => res.json());
  const userData = userProfile.items[0];

  if (!userData) {
    return null;
  }

  let address = null;

  if (userData.about_me) {
    address = findLightningAddressInText(userData.about_me);
  }

  if (!address) return null;

  return {
    method: "lnurl",
    address: address,
    ...getOriginData(),
    description: htmlToText(userData.about_me) ?? "",
    icon: userData.profile_image ?? "",
    name: userData.display_name,
  };
}

const StackOverflow = {
  urlMatcher,
  battery,
};

export default StackOverflow;
