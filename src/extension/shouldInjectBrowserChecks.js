// Checks the doctype of the current document if it exists
export function doctypeCheck() {
  if (window && window.document && window.document.doctype) {
    return window.document.doctype.name === "html";
  } else {
    return true;
  }
}

// Returns whether or not the extension (suffix) of the current document is prohibited
export function suffixCheck() {
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
export function documentElementCheck() {
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
