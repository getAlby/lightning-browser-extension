import browser from "webextension-polyfill";
import api from "~/common/lib/api";

import injectScript from "./injectScript";
import shouldInject from "./shouldInject";

async function onstart() {
  // eslint-disable-next-line no-console
  const inject = await shouldInject();
  if (!inject) {
    return;
  }
  const accountDetails = await api.getAccount();

  // window.webln
  injectScript(browser.runtime.getURL("js/inpageScriptWebLN.bundle.js"));

  // window.webbtc
  // TODO: Add check if current account has keys
  injectScript(browser.runtime.getURL("js/inpageScriptWebBTC.bundle.js"));

  // window.nostr
  if (accountDetails.nostrEnabled) {
    injectScript(browser.runtime.getURL("js/inpageScriptNostr.bundle.js"));
  }

  // window.alby
  injectScript(browser.runtime.getURL("js/inpageScriptAlby.bundle.js"));

  // window.liquid
  // eslint-disable-next-line no-console
  if (accountDetails.isLiquidEnabled) {
    injectScript(browser.runtime.getURL("js/inpageScriptLiquid.bundle.js"));
  }
}

onstart();
