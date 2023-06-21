import browser from "webextension-polyfill";
import api from "~/common/lib/api";

import injectScript from "./injectScript";
import shouldInject from "./shouldInject";

async function onstart() {
  const inject = await shouldInject();
  if (!inject) {
    return;
  }

  const account = await api.getAccount();
  // window.webln
  injectScript(browser.runtime.getURL("js/inpageScriptWebLN.bundle.js"));

  // window.webbtc
  if (account.hasMnemonic) {
    injectScript(browser.runtime.getURL("js/inpageScriptWebBTC.bundle.js"));
  }

  // window.nostr
  if (account.nostrEnabled) {
    injectScript(browser.runtime.getURL("js/inpageScriptNostr.bundle.js"));
  }

  // window.alby
  injectScript(browser.runtime.getURL("js/inpageScriptAlby.bundle.js"));
}

onstart();
