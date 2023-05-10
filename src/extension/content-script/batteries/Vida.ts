import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";

const urlMatcher = /^https:\/\/vida.page\/(\w+)$/;

function battery(): void {
  const monetizationTag = document.querySelector<HTMLMetaElement>(
    'head > meta[name="lightning" i]'
  );
  let address;
  const originData = getOriginData();

  if (monetizationTag) {
    address = monetizationTag.content.replace(/lnurlp:/i, "");
  }

  const titleElement = document.querySelector<HTMLHeadingElement>("h1");

  if (titleElement) {
    const descriptionElement = titleElement.nextElementSibling;
    if (titleElement.innerText) {
      originData.name = titleElement.innerText;
    }

    if (descriptionElement) {
      const discoveredAddress = findLightningAddressInText(
        descriptionElement.textContent ?? ""
      );
      // default to the discovered address
      if (discoveredAddress) {
        address = discoveredAddress;
      }
      if (descriptionElement.textContent) {
        originData.description = descriptionElement.textContent;
      }
    }
  }

  if (!address) return;

  const icon =
    document.querySelector<HTMLImageElement>("button > div > img")?.src;
  if (icon) {
    originData.icon = icon;
  }
  setLightningData([
    {
      method: "lnurl",
      address,
      ...originData,
    },
  ]);
}

const vida = {
  urlMatcher,
  battery,
};
export default vida;
