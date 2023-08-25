import browser from "webextension-polyfill";

import { isManifestV3 } from "~/common/utils/mv3";
import {
  injectScript,
  injectScriptByUrl,
} from "~/extension/content-script/injectScript";

async function onstart() {
  // Inject in-page scripts for MV2
  if (!isManifestV3) {
    // Try to inject inline
    injectScript("@@@WINDOW_PROVIDER@@@");
    // Fallback if inline script is blocked via CSP
    injectScriptByUrl(browser.runtime.getURL("js/inpageScript.bundle.js"));
  }
}

onstart();
