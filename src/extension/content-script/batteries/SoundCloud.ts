import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";

const urlMatcher =
  /^https:\/\/soundcloud.com\/([^/]+)(\/([^/]+))?(\/([^/]+))?(\/([^/]+))?$/;

function battery(): void {
  const urlParts = document.location
    .toString()
    .replace("https://soundcloud.com", "")
    .split("/");
  const username = urlParts[1];

  if (username && !urlParts[2]) {
    handleProfilePage();
  } else if (urlParts[2] === "sets" || urlParts[3] === "sets") {
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
  if (!webProfiles || !webProfiles.textContent) return;

  const address = findLightningAddressInText(webProfiles.textContent);
  if (!address) return;

  setLightningData([
    {
      method: "lnurl",
      address: address,
      ...getOriginData(),
      description:
        document.querySelector<HTMLDivElement>(".truncatedUserDescription")
          ?.innerText ?? "",
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
