import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";

const urlMatcher =
  /^https?:\/\/(?:[^/]+\.)?medium\.com\/@([^/?#]+)\/?(?:\?.*)?(?:#.*)?$/;

const battery = (): void => {
  // 1. Search for Lightning addresses in the bio (more robust approach)
  // We search for elements that typically contain the bio
  const bioSelectors = [
    '[data-testid="authorBio"]',
    'meta[name="description"]',
  ];

  let address = null;
  let finalBioText = "";

  for (const selector of bioSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      const bioText =
        element instanceof HTMLMetaElement
          ? element.content
          : (element as HTMLElement).innerText;
      if (bioText) {
        address = findLightningAddressInText(bioText);
        if (address) {
          finalBioText = bioText;
          break;
        }
      }
    }
  }

  if (!address) return;

  // 2. Extract name and icon (robust via og-tags)
  const name =
    document
      .querySelector('meta[property="og:title"]')
      ?.getAttribute("content")
      ?.split(" – ")[0] ||
    document.querySelector("h1")?.innerText ||
    "Medium Author";

  const icon =
    document
      .querySelector('meta[property="og:image"]')
      ?.getAttribute("content") ||
    document.querySelector('img[src*="/profile/"]')?.getAttribute("src") ||
    "";

  setLightningData([
    {
      method: "lnurl",
      address: address,
      ...getOriginData(),
      description: finalBioText.substring(0, 160),
      name: name,
      icon: icon,
    },
  ]);
};

const Medium = {
  urlMatcher,
  battery,
};

export default Medium;
