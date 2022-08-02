import getOriginData from "../originData";
import setLightningData from "../setLightningData";

const urlMatcher = /^https:\/\/(.+\.)?medium.com\/(\S+)?/;

const battery = (): void => {
  const authorLinkSelector = getAuthorLinkSelector();
  if (!authorLinkSelector) return;

  const shortBio = document.querySelector<HTMLParagraphElement>(
    `${authorLinkSelector}~p:last-of-type`
  )?.innerText;
  if (!shortBio) return;

  const match = shortBio.match(/(⚡:?|lightning:|lnurl:)\s?(\S+@\S+)/i);
  if (!match) return;

  setLightningData([
    {
      method: "lnurl",
      address: match[2],
      ...getOriginData(),
      description: shortBio,
      name:
        document.querySelector<HTMLHeadingElement>(".pw-author-name")
          ?.innerText ?? "",
      icon:
        document.querySelector<HTMLImageElement>(`${authorLinkSelector} img`)
          ?.src ?? "",
    },
  ]);
};

function getAuthorLinkSelector(): string | null {
  const subdomain = getSubdomain();
  if (subdomain) {
    return `a[href="/"]`;
  }

  const username = getUsername();
  if (username) {
    return `a[href="/${username}"]`;
  }

  return null;
}

function getSubdomain(): string | null {
  const match = window.location.toString().match(urlMatcher);
  if (match && match[1]) {
    return match[1].substring(0, match[1].length - 1);
  }

  return null;
}

function getUsername(): string | null {
  const urlParts = document.location.pathname.split("/");
  if (urlParts[1]) {
    return urlParts[1];
  }

  return null;
}

const Medium = {
  urlMatcher,
  battery,
};

export default Medium;
