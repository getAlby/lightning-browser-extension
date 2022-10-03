import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";

const urlMatcher =
  /^https:\/\/soundcloud.com\/([^/]+)(\/([^/]+))?(\/([^/]+))?(\/([^/]+))?$/;

const pages = ["popular-tracks", "tracks", "albums", "sets", "reposts"];
function battery(): void {
  const urlParts = document.location
    .toString()
    .replace("https://soundcloud.com", "")
    .split("/");
  const username = urlParts[1];
  const page = urlParts[2];

  if (username && (!page || pages.includes(page))) {
    handleProfilePage();
  } else if (username && page) {
    handleTrackPage();
  }
}

function handleTrackPage() {
  const description = document.querySelector<HTMLDivElement>(
    ".truncatedAudioInfo__content .sc-text-body"
  );
  if (!description) return;

  const address = findLightningAddressInText(description.innerText);
  if (!address) return;

  setLightningData([
    {
      method: "lnurl",
      address: address,
      ...getOriginData(),
      description:
        document.querySelector<HTMLDivElement>(
          ".soundTitle__titleHeroContainer"
        )?.innerText ?? "",
      name:
        document.querySelector<HTMLAnchorElement>(
          ".userBadge__username .userBadge__usernameLink"
        )?.innerText ?? "",
      icon:
        document
          .querySelector<HTMLSpanElement>(`.userBadge__avatar span.sc-artwork`)
          ?.style.backgroundImage.slice(4, -1)
          .replace(/"/g, "") ?? "",
    },
  ]);
}

function handleProfilePage() {
  const webProfiles = document.querySelector<HTMLDivElement>(".web-profiles");
  const linkElement = document.querySelector<HTMLAnchorElement>(
    ".web-profiles a[href*='getalby.com']"
  );
  const descriptionElement = document.querySelector<HTMLDivElement>(
    ".truncatedUserDescription"
  );

  if (!webProfiles || !webProfiles.textContent) return;

  let text = webProfiles.textContent;

  if (linkElement) {
    const url = new URL(linkElement.href);
    text += url.searchParams.get("url") + " ";
  }

  if (descriptionElement) {
    text += descriptionElement.innerText;
  }

  const address = findLightningAddressInText(text);
  if (!address) return;

  setLightningData([
    {
      method: "lnurl",
      address: address,
      ...getOriginData(),
      description: descriptionElement?.innerText ?? "",
      name:
        document
          .querySelector<HTMLHeadingElement>(".profileHeaderInfo__userName")
          ?.childNodes[0]?.textContent?.trim() ?? "",
      icon:
        document
          .querySelector<HTMLSpanElement>(
            `.profileHeaderInfo__avatar span.sc-artwork`
          )
          ?.style.backgroundImage.slice(4, -1)
          .replace(/"/g, "") ?? "",
    },
  ]);
}

const soundCloud = {
  urlMatcher,
  battery,
};
export default soundCloud;
