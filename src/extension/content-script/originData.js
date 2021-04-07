// https://github.com/joule-labs/joule-extension/blob/1ba2050ef0dcfacdd6bfedf291acaff39d1baa8a/src/app/utils/prompt.ts

function getDocumentName() {
  const nameMeta = document.querySelector(
    'head > meta[property="og:site_name"]'
  );
  if (nameMeta) {
    return nameMeta.content;
  }

  const titleMeta = document.querySelector('head > meta[name="title"]');
  if (titleMeta) {
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

  // Try for favicon
  const favicon = document.querySelector('head > link[rel="shortcut icon"]');
  if (favicon) {
    return makeAbsoluteUrl(favicon.href);
  }

  // Fallback to default favicon path, let it be replaced in view if it fails
  return `${window.location.origin}/favicon.ico`;
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
    domain: window.location.origin,
    name: getDocumentName(),
    icon: getDocumentIcon(),
    external: true, // indicate that the call is coming from the website (and not made internally within the extension)
  };
}
