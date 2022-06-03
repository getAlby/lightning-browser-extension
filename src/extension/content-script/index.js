import browser from "webextension-polyfill";

import extractLightningData from "./batteries";
import injectScript from "./injectScript";
import getOriginData from "./originData";
import shouldInject from "./shouldInject";

// WebLN calls that can be executed from the WebLNProvider.
// Update when new calls are added
const weblnCalls = [
  "enable",
  "getInfo",
  "lnurl",
  "sendPaymentOrPrompt",
  "keysendOrPrompt",
  "makeInvoice",
  "signMessageOrPrompt",
  "verifyMessage",
];
// calls that can be executed when webln is not enabled for the current content page
const disabledCalls = ["enable"];

let isEnabled = false; // store if webln is enabled for this content page

if (shouldInject()) {
  injectScript();

  // extract LN data from websites
  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "extractLightningData") {
      extractLightningData();
    }
  });

  // message listener to listen to inpage webln calls
  // those calls get passed on to the background script
  // (the inpage script can not do that directly, but only the inpage script can make webln available to the page)
  window.addEventListener("message", (ev) => {
    // Only accept messages from the current window
    if (ev.source !== window) {
      return;
    }
    if (ev.data && ev.data.application === "LBE" && !ev.data.response) {
      // limit the calls that can be made from webln
      // only listed calls can be executed
      // if not enabled only enable can be called.
      const availableCalls = isEnabled ? weblnCalls : disabledCalls;
      if (!availableCalls.includes(ev.data.type)) {
        console.error("Function not available. Is the provider enabled?");
        return;
      }

      const messageWithOrigin = {
        type: `webln/${ev.data.type}`, // TODO: rename type to action
        args: ev.data.args,
        application: "LBE",
        public: true, // indicate that this is a public call from the content script
        prompt: true,
        origin: getOriginData(),
      };
      const replyFunction = (response) => {
        // if it is the enable call we store if webln is enabled for this content script
        if (ev.data.type == "enable") {
          isEnabled = response.data?.enabled;
        }
        window.postMessage(
          {
            application: "LBE",
            response: true,
            data: response,
          },
          "*" // TODO use origin
        );
      };
      return browser.runtime
        .sendMessage(messageWithOrigin)
        .then(replyFunction)
        .catch(replyFunction);
    }
  });
}
export {};
