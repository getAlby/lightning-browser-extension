import { Battery } from "~/types";

import getOriginData from "../originData";
import { findLightningAddressInText } from "./helpers";

const urlMatcher = /^https:\/\/vimeo.com\/.*\d{4,}\/?$/;

const battery = (): Battery | void => {
  const videoDescription = document.querySelector("[data-description-content]");
  const channelLink = document.querySelector(
    ".clip_info-subline--watch .js-user_link"
  );
  if (!videoDescription || !channelLink) {
    return;
  }
  const text = videoDescription.textContent || "";
  let match;
  let recipient;
  const contentUri = document.location.toString();
  // check for an lnurl
  if ((match = text.match(/(lnurlp:)(\S+)/i))) {
    recipient = match[2];
  }
  // if there is no lnurl we check for a zap emoji with a lightning address
  // we check for the @-sign to try to limit the possibility to match some invalid text (e.g. random emoji usage)
  else if ((match = findLightningAddressInText(text))) {
    recipient = match;
  } else {
    return;
  }

  const name = channelLink.textContent || "";
  const imageUrl =
    document.querySelector<HTMLImageElement>(".clip_info-subline--watch img")
      ?.src || "";
  return {
    method: "lnurl",
    address: recipient,
    ...getOriginData(),
    name,
    icon: imageUrl,
    contentUri: contentUri,
  };
};

const VimeoVideo = {
  urlMatcher,
  battery,
};

export default VimeoVideo;
