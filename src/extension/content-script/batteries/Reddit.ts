import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";

const urlMatcher =
  /^https?:\/\/(?:www\.)?reddit\.com\/(?:u|user)\/([^/?#]+)\/?(?:\?.*)?(?:#.*)?$/;

const battery = (): void => {
  const bioSelectors = [
    "#profile--about-card p",
    '[data-testid="user-description"]',
    ".ProfileSidebar__about",
  ];
  let address = null;
  let finalBioText = "";

  for (const selector of bioSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = (element as HTMLElement).innerText;
      if (text) {
        address = findLightningAddressInText(text);
        if (address) {
          finalBioText = text;
          break;
        }
      }
    }
  }

  if (!address) return;

  const name =
    (document.querySelector("h1") as HTMLElement | null)?.innerText ||
    (document.querySelector('[data-testid="user-name"]') as HTMLElement | null)
      ?.innerText ||
    "Reddit User";

  const icon =
    document.querySelector('img[src*="avatar"]')?.getAttribute("src") || "";

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
