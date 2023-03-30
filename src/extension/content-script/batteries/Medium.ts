import { Battery } from "~/types";

import getOriginData from "../originData";
import { findLightningAddressInText } from "./helpers";

const urlMatcher = /^https:\/\/(.+\.)?medium.com\/(\S+)?/;

const battery = (): Battery | void => {
  const name =
    document.querySelector<HTMLHeadingElement>(".pw-author-name")?.innerText;
  const description =
    document.querySelector<HTMLParagraphElement>("main ~ div")?.innerText;
  if (!name || !description) return;

  const match = findLightningAddressInText(description);
  if (!match) return;
  return {
    method: "lnurl",
    address: match,
    ...getOriginData(),
    description,
    name,
    icon:
      document.querySelector<HTMLImageElement>(`img[alt*='${name}']`)?.src ??
      "",
    getContentMetadata: getContentMetadata,
  };
};

const getContentMetadata = (): Record<string, unknown> => {
  const scrollPosition = window.scrollY;

  return {
    scroll_position: scrollPosition,
  };
};
const Medium = {
  urlMatcher,
  battery,
};

export default Medium;
