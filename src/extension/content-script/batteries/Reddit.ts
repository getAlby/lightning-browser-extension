import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";

const urlMatcher = /^https?:\/\/(?:www\.)?reddit\.com\/(?:u|user)\/([^/?#]+)/;

const battery = (): void => {
  // Primary: scan ALL <p> elements within known profile bio containers
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
      // Scan all <p> elements inside the container
      const paragraphs = container.querySelectorAll("p");
      if (paragraphs.length > 0) {
        for (const p of Array.from(paragraphs)) {
          const text = (p as HTMLElement).innerText;
          if (text) {
            address = findLightningAddressInText(text);
            if (address) {
              finalBioText = text;
              break;
            }
          }
        }
      } else {
        // Fallback: use the container text directly if no <p> children
        const text = (container as HTMLElement).innerText ?? "";
        if (text) {
          address = findLightningAddressInText(text);
          if (address) {
            finalBioText = text;
          }
        }
      }

      if (address) break;
    }
  }

  // Return null gracefully if no Lightning address found
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
