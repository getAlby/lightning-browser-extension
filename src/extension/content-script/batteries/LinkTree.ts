import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";

const urlMatcher = /^https:\/\/linktr.ee\/(\w+)$/;

function battery(): void {
  const linkElement = document.querySelector<HTMLAnchorElement>(
    "a[href*='getalby.com']"
  );
  const description = document.querySelector<HTMLMetaElement>(
    'head > meta[name="description"]'
  );

  let text = description?.content;

  if (linkElement) {
    const url = new URL(linkElement.href);
    text += url.searchParams.get("url") + " ";
  }

  const address = findLightningAddressInText(text ?? "");
  if (!address) return;

  setLightningData([
    {
      method: "lnurl",
      address,
      ...getOriginData(),
      description:
        document.querySelector<HTMLMetaElement>(
          'head > meta[name="description"]'
        )?.content ?? "",
      name:
        document.querySelector<HTMLHeadingElement>("h1")?.innerText.slice(1) ??
        "",
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
