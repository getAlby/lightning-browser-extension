import getOriginData from "../originData";
import setLightningData from "../setLightningData";

const urlMatcher = /^https:\/\/github.com\/([^/]+)*/;

const battery = (): void => {
  const matchData = document.location.toString().match(urlMatcher);
  if (!matchData) return;

  const shortBio =
    document.querySelector<HTMLElement>("[data-bio-text]")?.innerText;
  if (!shortBio) return;

  const match = shortBio.match(/(⚡:?|lightning:|lnurl:)\s?(\S+@\S+)/i);
  if (!match) return;

  setLightningData([
    {
      method: "lnurl",
      recipient: match[2],
      ...getOriginData(),
      description: shortBio,
      name:
        document.querySelector<HTMLHeadingElement>('[itemprop="name"]')
          ?.innerText ?? "",
      icon:
        document.querySelector<HTMLImageElement>(`img.avatar-user`)?.src ?? "",
    },
  ]);
};

const GitHubProfile = {
  urlMatcher,
  battery,
};

export default GitHubProfile;
