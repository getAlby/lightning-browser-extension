import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";

// TODO: Detect Mastodon instance
const urlMatcher = /^https:\/\/libretooth.gr\/@.*\/?$/;

const battery = (): void => {
  const profileBio = document.querySelector(
    ".account__header__bio .account__header__content p"
  );
  if (!profileBio) {
    return;
  }
  const text = profileBio.textContent || "";

  let match;
  let recipient;
  let zapElement;

  // Check for an LNURL
  if ((match = text.match(/(lnurlp:)(\S+)/i))) {
    recipient = match[2];
  }
  // If there is no LNURL, try to match an Alby link
  else if ((match = findLightningAddressInText(text))) {
    recipient = match;
  }
  // Mastodon converts zap emoji to img. Let's try to find it and get LNURL
  else if ((zapElement = profileBio.querySelector('img[title=":zap:"'))) {
    if (zapElement) {
      const lnaddress = zapElement.nextSibling?.textContent as string;
      const match = lnaddress.match(/(:?)\s?(\S+@\S+)/i);
      if (match) recipient = match[2];
      else return;
    } else {
      return;
    }
  } else {
    return;
  }

  const name =
    document.querySelector(".account__header__tabs__name h1 span")
      ?.textContent || "";
  const imageUrl =
    document.querySelector<HTMLImageElement>(".account__avatar img")?.src || "";
  setLightningData([
    {
      method: "lnurl",
      address: recipient,
      ...getOriginData(),
      name,
      icon: imageUrl,
    },
  ]);
};

const Mastodon = {
  urlMatcher,
  battery,
};

export default Mastodon;
