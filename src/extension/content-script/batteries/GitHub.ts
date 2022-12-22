import getOriginData from "../originData";
import { findLightningAddressInText, setLightningData } from "./helpers";

const urlMatcher = /^https:\/\/github.com\/([^/]+)(\/)?(\/([^/]+))?(\/)?$/;

const battery = (): void => {
  const urlParts = document.location.pathname.split("/");
  const username = urlParts[1];
  const repo = urlParts[2];

  if (username && repo) {
    handleRepositoryPage(username);
  } else if (username) {
    const lightningData = handleProfilePage() || handleOrganizationPage();
    if (lightningData) {
      setLightningData([lightningData]);
    }
  }
};

function parseElement(elementSelector: string) {
  const text = document.querySelector<HTMLElement>(elementSelector)?.innerText;
  if (text) {
    let match;
    if ((match = findLightningAddressInText(text))) return match;
  }

  // Fallback for Windows and Linux
  const zap = document
    .querySelector<HTMLElement>(elementSelector)
    ?.querySelector('[alias="zap"]');
  if (zap) {
    const lnaddress = zap.nextSibling?.textContent as string;
    const match = lnaddress.match(/(:?)\s?(\S+@\S+)/i);
    if (match) return match[2];
  }
}

function handleProfilePage() {
  const shortBioElement = document.querySelector<HTMLHeadingElement>(
    ".Layout-sidebar .h-card [data-bio-text]"
  );

  // This is not a GitHub profile
  if (!shortBioElement) return null;

  const address =
    parseElement(".Layout-sidebar .h-card") ||
    parseElement(".Layout-main article");

  if (!address) return null;

  return {
    method: "lnurl",
    address: address,
    ...getOriginData(),
    description: shortBioElement?.innerText ?? "",
    name:
      document.querySelector<HTMLHeadingElement>(
        '.Layout-sidebar .h-card [itemprop="name"]'
      )?.innerText ?? "",
    icon:
      document.querySelector<HTMLImageElement>(
        `.Layout-sidebar .h-card img.avatar-user`
      )?.src ?? "",
  };
}

function handleOrganizationPage() {
  const orgName = document.querySelector<HTMLHeadingElement>(
    ".pagehead.orghead h1"
  );
  const shortBioElement = document.querySelector<HTMLElement>(
    ".pagehead.orghead h1+div"
  );

  if (!orgName) return null;

  const address =
    parseElement(".pagehead.orghead h1+div") || parseElement("article");

  if (!address) return null;

  return {
    method: "lnurl",
    address: address,
    ...getOriginData(),
    description: shortBioElement?.innerText ?? "",
    name: orgName.innerText,
    icon:
      document.querySelector<HTMLImageElement>(`.pagehead.orghead img.avatar`)
        ?.src ?? "",
  };
}

function handleRepositoryPage(username: string) {
  const address = parseElement("article");

  if (address) {
    setLightningData([
      {
        method: "lnurl",
        address: address,
        ...getOriginData(),
        description:
          document.querySelector<HTMLHeadingElement>("article")?.innerText ??
          "",
        name: username,
        icon: "",
      },
    ]);
  }
}

const GitHubProfile = {
  urlMatcher,
  battery,
};

export default GitHubProfile;
