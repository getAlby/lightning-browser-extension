import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";

const urlMatcher = /https?:\/\/(?:www\.)?reddit\.com\/(?:u|user)\/([^/?#]+)\/?$/;

const battery = (): void => {
  // Reddit user profile extraction
  const bioSelectors = [
    "#profile--about-card p",
    "[data-testid='user-description']",
    ".ProfileSidebar__about"
  ];
  
  let bioText = "";
  for (const selector of bioSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      bioText = (element as HTMLElement).innerText;
      if (bioText) break;
    }
  }

  const address = findLightningAddressInText(bioText);
  if (!address) return;

  const name = document.querySelector("h1")?.innerText || 
               document.querySelector("[data-testid='user-name']")?.innerText || 
               "Reddit User";

  const icon = document.querySelector("img[src*='avatar']")?.getAttribute("src") || 
               "";

  setLightningData([
    {
      method: "lnurl",
      address: address,
      ...getOriginData(),
      description: bioText.substring(0, 160),
      name: name,
      icon: icon,
    },
  ]);
};

const Reddit = {
  urlMatcher,
  battery,
};

export default Reddit;
