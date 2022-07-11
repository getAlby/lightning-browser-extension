import getOriginData from "../originData";
import setLightningData from "../setLightningData";

const urlMatcher = /^https:\/\/github.com\/([^/]+)(\/([^/]+))?$/;

const battery = (): void => {
  const urlParts = document.location.pathname.split("/");
  const username = urlParts[1];
  const repo = urlParts[2];

  if (username && repo) {
    handleRepositoryPage(username);
  } else if (username) {
    handleProfilePage();
  }
};

function parseElement(elementSelector: string) {
  const text = document.querySelector<HTMLElement>(elementSelector)?.innerText;
  if (text) {
    const match = text.match(/(⚡:?|lightning:|lnurl:)\s?(\S+@\S+)/i);
    if (match) return match[2];
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
  if (!shortBioElement) return;

  const address =
    parseElement(".Layout-sidebar .h-card [data-bio-text]") ||
    parseElement(".Layout-main article");

  if (!address) return;

  setLightningData([
    {
      method: "lnurl",
      recipient: address,
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
    },
  ]);
}

function handleRepositoryPage(username: string) {
  const address = parseElement("article");

  if (address) {
    setLightningData([
      {
        method: "lnurl",
        recipient: address,
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
