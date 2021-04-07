// https://github.com/joule-labs/joule-extension/blob/develop/src/content_script/shouldInject.ts
// Whether or not to inject the WebLN listeners
// TODO: Add user settings for whether or not to inject
export default function shouldInject() {
  return doctypeCheck() && suffixCheck() && documentElementCheck();
}

// Checks the doctype of the current document if it exists
function doctypeCheck() {
  const doctype = window.document.doctype;
  if (doctype) {
    return doctype.name === "html";
  } else {
    return true;
  }
}

// Returns whether or not the extension (suffix) of the current document is prohibited
function suffixCheck() {
  const prohibitedTypes = [/\.xml$/, /\.pdf$/];
  const currentUrl = window.location.pathname;
  for (const type of prohibitedTypes) {
    if (type.test(currentUrl)) {
      return false;
    }
  }
  return true;
}

// Checks the documentElement of the current document
function documentElementCheck() {
  // todo: correct?
  if (!document || !document.documentElement) {
    return false;
  }
  const docNode = document.documentElement.nodeName;
  if (docNode) {
    return docNode.toLowerCase() === "html";
  }
  return true;
}
