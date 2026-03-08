import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";

const urlMatcher = /^https?:\/\/(?:www\.)?reddit\.com\/(?:u|user)\/([^/?#]+)/;

const battery = (): void => {
  // Scan the full text content of known profile bio containers
  const bioContainerSelectors = [
    "#profile--about-card",
    '[data-testid="user-description"]',
    ".ProfileSidebar__about",
    ".userProfileApp-sortAndBannerArea",
    ".ProfilePage__bio",
  ];

  let address: string | null = null;
  let finalBioText = "";

  for (const containerSelector of bioContainerSelectors) {
    const container = document.querySelector(containerSelector);
    if (container) {
      // Use full innerText of the container to avoid missing addresses in nested elements
      const text = (container as HTMLElement).innerText ?? "";
      if (text) {
        address = findLightningAddressInText(text);
        if (address) {
          finalBioText = text;
          break;
        }
      }
    }
  }

  // Return null gracefully if no Lightning address found
  if (!address) return;

  const originData = getOriginData();

  const name =
    (document.querySelector("h1") as HTMLElement | null)?.innerText ||
    (document.querySelector('[data-testid="user-name"]') as HTMLElement | null)
      ?.innerText ||
    originData.name ||
    "Reddit User";

  const icon =
    document
      .querySelector('#profile--avatar img, [data-testid="profile-avatar"] img')
      ?.getAttribute("src") ||
    document.querySelector('img[src*="avatar"]')?.getAttribute("src") ||
    originData.icon ||
    "";

  setLightningData([
    {
      method: "lnurl",
      address,
      ...originData,
      description: finalBioText.substring(0, 160),
      name: name.trim(),
      icon,
    },
  ]);
};

export default { urlMatcher, battery };
