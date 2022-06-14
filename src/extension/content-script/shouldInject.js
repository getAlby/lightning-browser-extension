import msg from "../../common/lib/msg";

// https://github.com/joule-labs/joule-extension/blob/develop/src/content_script/shouldInject.ts
// Whether or not to inject the WebLN listeners
export default async function shouldInject() {
  const notBlocked = await blocklistCheck();
  const isHTML = doctypeCheck();
  const noProhibitedType = suffixCheck();
  const hasDocumentElement = documentElementCheck();

  return notBlocked && isHTML && noProhibitedType && hasDocumentElement;
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

async function blocklistCheck() {
  try {
    const currentHost = window.location.host;
    const blocklistData = await msg.request("getBlocklist", {
      host: currentHost,
    });
    return !blocklistData.blocked; // return true if not blocked
  } catch (e) {
    if (e instanceof Error) console.error(e);
    return false;
  }
}
