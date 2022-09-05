import browser from "webextension-polyfill";

import injectScript from "./injectScript";
import shouldInject from "./shouldInject";

async function onstart() {
  const inject = await shouldInject();
  if (!inject) {
    return;
  }

  injectScript(browser.runtime.getURL("js/inpageScriptWebLN.bundle.js")); // injects the webln object
}
onstart();
