import browser from "webextension-polyfill";
import api from "~/common/lib/api";

import injectScript from "./injectScript";
import shouldInject from "./shouldInject";

async function onstart() {
  const inject = await shouldInject();
  if (!inject) {
    return;
  }
  const accountDetails = await api.getAccount();

  // window.webln
  injectScript(browser.runtime.getURL("js/inpageScriptWebLN.bundle.js"));

  // window.nostr
  if (accountDetails.nostrEnabled) {
    injectScript(browser.runtime.getURL("js/inpageScriptNostr.bundle.js"));
  }

  // window.liquid
  if (accountDetails.liquidEnabled) {
    injectScript(browser.runtime.getURL("js/inpageScriptLiquid.bundle.js"));
  }
}

onstart();
