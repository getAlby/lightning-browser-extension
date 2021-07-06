// https://github.com/joule-labs/joule-extension/blob/1ba2050ef0dcfacdd6bfedf291acaff39d1baa8a/src/app/utils/prompt.ts

function getDocumentName() {
  const ogSiteName = document.querySelector(
    'head > meta[property="og:site_name"]'
  );
  if (ogSiteName && ogSiteName.content && ogSiteName.content !== "") {
    return ogSiteName.content;
  }
  const ogTitle = document.querySelector('head > meta[property="og:title"]');
  if (ogTitle && ogTitle.content && ogTitle.content !== "") {
    return ogTitle.content;
  }

  const titleMeta = document.querySelector('head > meta[name="title"]');
  if (titleMeta && titleMeta.content && titleMeta.content !== "") {
    return titleMeta.content;
  }

  return document.title;
}

function getDocumentIcon() {
  // Search for largest icon first
  const allIcons = Array.from(
    document.querySelectorAll('head > link[rel="icon"]')
  ).filter((icon) => !!icon.href);

  if (allIcons.length) {
    const href = allIcons.sort((a, b) => {
      const aSize = parseInt(a.getAttribute("sizes") || "0", 10);
      const bSize = parseInt(b.getAttribute("sizes") || "0", 10);
      return bSize - aSize;
    })[0].href;
    return makeAbsoluteUrl(href);
  }

  const ogImageSecure = document.querySelector(
    'head > meta[property="og:image:secure"]'
  );
  if (ogImageSecure) {
    return makeAbsoluteUrl(ogImageSecure.content);
  }
  const ogImage = document.querySelector('head > meta[property="og:image"]');
  if (ogImage) {
    return makeAbsoluteUrl(ogImage.content);
  }
  // Try for favicon
  const favicon = document.querySelector('head > link[rel="shortcut icon"]');
  if (favicon) {
    return makeAbsoluteUrl(favicon.href);
  }

  // Fallback to default favicon path, let it be replaced in view if it fails
  return `${window.location.origin}/favicon.ico`;
}

function getDocumentDescription() {
  const ogDescription = document.querySelector(
    'head > meta[property="og:description"]'
  );
  if (ogDescription && ogDescription.content && ogDescription.content !== "") {
    return ogDescription.content;
  }

  const descriptionMeta = document.querySelector(
    'head > meta[name="description"]'
  );
  if (
    descriptionMeta &&
    descriptionMeta.content &&
    descriptionMeta.content !== ""
  ) {
    return descriptionMeta.content;
  }

  return "";
}

// Makes absolute path given any path on the site, namely relative ones
// e.g. ./favicon.ico becomes https://site.com/favicon.ico
function makeAbsoluteUrl(path) {
  return new URL(path, window.location.origin).href;
}

export default function getOriginData() {
  if (!window || !document) {
    throw new Error("Must be called in browser context");
  }

  return {
    location: window.location.toString(),
    domain: window.location.origin,
    host: window.location.host,
    pathname: window.location.pathname,
    name: getDocumentName(),
    description: getDocumentDescription(),
    icon: getDocumentIcon(),
    external: true, // indicate that the call is coming from the website (and not made internally within the extension)
  };
}
