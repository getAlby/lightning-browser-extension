import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";

const urlMatcher = /^https:\/\/linktr.ee\/([\S]+)$/;

function battery(): void {
  const linkElement = document.querySelector<HTMLAnchorElement>(
    "a[href*='getalby.com']"
  );
  const description = [...document.querySelectorAll("h2")].filter(
    (el) => el.id != "ot-pc-title"
  )[0];

  let text = description?.innerText + " ";

  if (linkElement) {
    text += linkElement.href + " ";
  }

  const address = findLightningAddressInText(text ?? "");
  if (!address) return;

  setLightningData([
    {
      method: "lnurl",
      address,
      ...getOriginData(),
      description: description?.innerText ?? "",
      name: document.querySelector<HTMLHeadingElement>("h1")?.innerText ?? "",
      icon:
        document.querySelector<HTMLImageElement>('[data-testid="ProfileImage"]')
          ?.src ?? "",
    },
  ]);
}

const linkTree = {
  urlMatcher,
  battery,
};
export default linkTree;
