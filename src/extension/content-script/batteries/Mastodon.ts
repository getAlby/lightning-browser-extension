import getOriginData from "../originData";
import setLightningData from "../setLightningData";

const urlMatcher =
  /^https:\/\/(bitcoinhackers\.org|kosmos\.social)\/(web\/)?@\S+/;

const battery = (): void => {
  const bio = document.querySelector(
    ".public-account-bio, .account__header__bio .account__header__content"
  );

  if (!bio) return;

  let match, recipient;
  if ((match = (bio.textContent || "").match(/lnurlp:(\S+)/i))) {
    recipient = match[1];
  } else {
    const zapElements = document.querySelectorAll(
      '.public-account-bio img[src*="26a1.svg"], .account__header__bio img[src*="26a1.svg"]'
    );
    for (const zapElement of zapElements) {
      if (
        (match = (zapElement.nextSibling?.textContent || "").match(/(\S+@\S+)/))
      ) {
        recipient = match[1];
        break;
      }
    }
  }

  if (!recipient) return;

  setLightningData([
    {
      method: "lnurl",
      recipient: recipient,
      ...getOriginData(),
      name:
        document
          .querySelector(".public-account-header__tabs__name > h1")
          ?.childNodes[0]?.nodeValue?.trim() ??
        document.querySelector(".account__header__tabs__name > h1 > span")
          ?.textContent ??
        "",
      description:
        document.querySelector(
          ".public-account-bio, .account__header__bio .account__header__content"
        )?.textContent ?? "",
      icon:
        document.querySelector<HTMLImageElement>("#profile_page_avatar")?.src ||
        document
          .querySelector<HTMLElement>(".account__avatar")
          ?.style.backgroundImage.slice(4, -1)
          .replace(/"/g, "") ||
        "",
    },
  ]);
};

const Mastodon = {
  urlMatcher,
  battery,
};

export default Mastodon;
