import fetchAdapter from "@vespaiach/axios-fetch-adapter";
import axios from "axios";
import type { Battery } from "~/types";

import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";

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

  if (route === "questions") {
    lightningData = await handleQuestionPage(userOrQuestionId);
  }

  if (lightningData) setLightningData([lightningData]);
};

function htmlToText(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.textContent;
}

async function handleQuestionPage(questionId: string): Promise<Battery | null> {
  const questionResponse = await axios.get(
    // The filter can be generated here: https://api.stackexchange.com/docs/users-by-ids
    `https://api.stackexchange.com/2.2/questions/${questionId}?site=stackoverflow&filter=!9bOY8fLl6`,
    { adapter: fetchAdapter }
  );

  if (!questionResponse) {
    return null;
  }

  const questionInfo = await questionResponse.data;

  if (questionInfo.error_id) {
    return null;
  }

  const questionData = questionInfo.items[0];

  if (!questionData || !questionData.accepted_answer_id) {
    return null;
  }

  const answerResponse = await axios.get(
    // The filter can be generated here: https://api.stackexchange.com/docs/users-by-ids
    `https://api.stackexchange.com/2.2/answers/${questionData.accepted_answer_id}?site=stackoverflow&filter=!-)QWsbXSB(JQ`,
    { adapter: fetchAdapter }
  );

  if (!answerResponse) {
    return null;
  }

  const answerInfo = await answerResponse.data;

  const answerData = answerInfo.items[0];

  if (!answerData || !answerData.owner) {
    return null;
  }

  const answererId = answerData.owner.user_id;
  const lightningData = await handleProfilePage(answererId);

  return lightningData;
}

async function handleProfilePage(userId: string): Promise<Battery | null> {
  const response = await axios.get(
    // The filter can be generated here: https://api.stackexchange.com/docs/users-by-ids
    `https://api.stackexchange.com/2.2/users/${userId}?site=stackoverflow&filter=!-B3yqvQ2YYGK1t-Hg_ydU`,
    { adapter: fetchAdapter }
  );

  if (!response) {
    return null;
  }

  const userInfo = await response.data;

  if (userInfo.error_id) {
    return null;
  }

  const userData = userInfo.items[0];

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
