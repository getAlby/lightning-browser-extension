import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";

const urlMatcher = /^https?:\/\/(?:[^/]+\.)?medium\.com\/@([^/?#]+)\/?(?:\?.*)?(?:#.*)?$/;

const battery = (): void => {
  const bioSelectors = [
    "meta[name=\"description\"]",
    "[data-testid=\"authorBio\"]",
    "[data-testid=\"author-bio\"]",
    "p.be.bf.z"
  ];

  let address = null;
  let finalBioText = "";

  for (const selector of bioSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      const bioText = element instanceof HTMLMetaElement ? element.content : (element as HTMLElement).innerText;
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

  const name =
    document.querySelector("meta[name=\"author\"]")?.getAttribute("content") ||
    document.querySelector("a[rel=\"author\"]")?.innerText ||
    document.querySelector("meta[property=\"og:title\"]")?.getAttribute("content")?.split(" – ")[0] ||
    "Medium Author";

  const icon =
    document.querySelector("meta[property=\"og:image\"]")?.getAttribute("content") ||
    document.querySelector("img[src*=\"/profile/\"]")?.getAttribute("src") ||
    "";

  setLightningData([
    {
      method: "lnurl",
      address,
      ...getOriginData(),
      description: finalBioText.substring(0, 160),
      name: name.trim(),
      icon,
    },
  ]);
};

export default { urlMatcher, battery };
