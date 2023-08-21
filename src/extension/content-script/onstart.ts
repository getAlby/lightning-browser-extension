import { isManifestV3 } from "~/common/utils/mv3";
import injectScript from "~/extension/content-script/injectScript";
import shouldInject from "./shouldInject";

async function onstart() {
  // eslint-disable-next-line no-console
  const inject = await shouldInject();
  if (!inject) {
    return;
  }

  // Inject in-page scripts for MV2
  if (!isManifestV3) {
    injectScript("@@@WINDOW_PROVIDER@@@");
  }

  // const account = await api.getAccount();
  // // window.alby
  // injectScript(browser.runtime.getURL("js/inpageScriptAlby.bundle.js"));

  // // window.webbtc
  // if (account.hasMnemonic) {
  //   injectScript(browser.runtime.getURL("js/inpageScriptWebBTC.bundle.js"));
  // }

  // // window.nostr
  // if (account.nostrEnabled) {
  //   injectScript(browser.runtime.getURL("js/inpageScriptNostr.bundle.js"));
  // }

  // // window.liquid
  // if (account.liquidEnabled) {
  //   injectScript(browser.runtime.getURL("js/inpageScriptLiquid.bundle.js"));
  // }
}

onstart();
