import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";

const urlMatcher = /^https:\/\/(.+\.)?medium.com\/(\S+)?/;

const battery = (): void => {
  const name =
    document.querySelector<HTMLHeadingElement>(".pw-author-name")?.innerText;

  const description = document
    .querySelector(".pw-author-name")
    ?.parentElement?.parentElement?.querySelector("p")
    ?.querySelector("span")?.textContent;

  if (!name || !description) return;

  const match = findLightningAddressInText(description);
  if (!match) return;

  setLightningData([
    {
      method: "lnurl",
      address: match,
      ...getOriginData(),
      description,
      name,
      icon:
        document.querySelector<HTMLImageElement>(`img[alt*='${name}']`)?.src ??
        "",
    },
  ]);
};

const Medium = {
  urlMatcher,
  battery,
};

export default Medium;
