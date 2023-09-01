import msg from "../../common/lib/msg";
import {
  doctypeCheck,
  documentElementCheck,
  suffixCheck,
} from "../shouldInjectBrowserChecks";

// https://github.com/joule-labs/joule-extension/blob/develop/src/content_script/shouldInject.ts
// Whether or not to inject the WebLN listeners
export default async function shouldInject() {
  const notBlocked = await blocklistCheck();
  const isHTML = doctypeCheck();
  const noProhibitedType = suffixCheck();
  const hasDocumentElement = documentElementCheck();

  return notBlocked && isHTML && noProhibitedType && hasDocumentElement;
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
