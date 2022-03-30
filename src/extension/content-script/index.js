import browser from "webextension-polyfill";
import getOriginData from "./originData";
import shouldInject from "./shouldInject";
import injectScript from "./injectScript";

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
import extractLightningData from "./batteries";

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
      if (!weblnCalls.includes(ev.data.type)) {
        return;
      }
      const messageWithOrigin = {
        type: ev.data.type, // TODO: rename type to action
        args: ev.data.args,
        application: "LBE",
        public: true, // indicate that this is a public call from the content script
        prompt: true,
        origin: getOriginData(),
      };
      const replyFunction = (response) => {
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
