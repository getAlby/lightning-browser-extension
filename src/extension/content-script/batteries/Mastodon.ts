import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";

const urlMatcher = /^https?:\/\/[^/]+\/@[^/?#]+(?:\/)?(?:\?.*)?(?:#.*)?$/;

const battery = (): void => {
  const isActivityPub = !!(
    document.querySelector(
      'link[rel="alternate"][type="application/activity+json"]'
    ) ||
    document.querySelector(
      'meta[property="og:site_name"][content*="Mastodon"]'
    ) ||
    document.querySelector(".p-note, .account__header__content")
  );

  if (!isActivityPub) return;

  const bioSelectors = [
    ".p-note",
    ".account__header__content",
    ".public-account-bio",
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
    (document.querySelector(".p-name") as HTMLElement | null)?.innerText ||
    (
      document.querySelector(
        ".account__header__tabs__name"
      ) as HTMLElement | null
    )?.innerText ||
    "Mastodon User";

  const icon =
    (document.querySelector(".u-photo") as HTMLImageElement)?.src ||
    (document.querySelector(".account__header__avatar img") as HTMLImageElement)
      ?.src ||
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
