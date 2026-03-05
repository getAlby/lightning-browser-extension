import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";

const urlMatcher = /https?:\/\/([^/]+)\/@([^/]+)/;

const battery = (): void => {
  // Mastodon Profile Extraktion (robuster Selektor fuer Bio)
  const bioSelectors = [
    ".p-note",
    ".account__header__content",
    ".public-account-bio"
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

  const name = document.querySelector(".p-name")?.innerText || 
               document.querySelector(".account__header__tabs__name")?.innerText || 
               "Mastodon User";

  const icon = document.querySelector(".u-photo")?.getAttribute("src") || 
               document.querySelector(".account__header__avatar img")?.getAttribute("src") || 
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

const Mastodon = {
  urlMatcher,
  battery,
};

export default Mastodon;
