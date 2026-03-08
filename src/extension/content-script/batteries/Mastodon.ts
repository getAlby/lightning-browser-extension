import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";

const urlMatcher = /^https?:\/\/[^/]+\/@[^/?#]+\/?(?:\?.*)?(?:#.*)?$/;

const battery = (): void => {
  const isProfile = !!(
    document.querySelector(
      ".p-author, .p-name, .account__header, .public-account-header"
    ) || document.querySelector('meta[property="og:type"][content="profile"]')
  );

  if (!isProfile) return;

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

  const iconElement =
    (document.querySelector(".u-photo") as HTMLImageElement) ||
    (document.querySelector(
      ".account__header__avatar img"
    ) as HTMLImageElement);
  let icon = "";
  if (iconElement) {
    icon = iconElement.src;
    if (icon && !icon.startsWith("http")) {
      icon = window.location.origin + (icon.startsWith("/") ? "" : "/") + icon;
    }
  }

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
