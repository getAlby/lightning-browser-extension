import browser from "webextension-polyfill";
import type { MessageWebLNWithOrigin, WebLNEventData } from "~/types";

import extractLightningData from "./batteries";
import injectScript from "./injectScript";
import getOriginData from "./originData";
import shouldInject from "./shouldInject";

// WebLN calls that can be executed from the WebLNProvider.
// Update when new calls are added
export const weblnCalls = [
  "enable",
  "getInfo",
  "lnurl",
  "sendPaymentOrPrompt",
  "keysendOrPrompt",
  "makeInvoice",
  "signMessageOrPrompt",
  "verifyMessage",
] as const;
// calls that can be executed when webln is not enabled for the current content page
const disabledCalls = ["enable"];

let isEnabled = false; // store if webln is enabled for this content page
let callActive = false; // store if a webln is currently active. Used to prevent multiple calls in parallel

async function init() {
  const inject = await shouldInject();
  if (!inject) {
    return;
  }

  injectScript(); // injects the webln object

  // extract LN data from websites
  browser.runtime.onMessage.addListener((request) => {
    if (request.action === "extractLightningData") {
      extractLightningData();
    }
  });

  // message listener to listen to inpage webln calls
  // those calls get passed on to the background script
  // (the inpage script can not do that directly, but only the inpage script can make webln available to the page)
  window.addEventListener(
    "message",
    (ev: { source: MessageEvent["source"]; data: WebLNEventData }) => {
      // Only accept messages from the current window
      if (ev.source !== window) {
        return;
      }

      // QUESTION: when does happen @bumi?: ev.data.response
      if (ev.data && ev.data.application === "LBE" && !ev.data.response) {
        // if a call is active we ignore the request
        if (callActive) {
          console.error("WebLN call already executing");
          return;
        }

        // limit the calls that can be made from webln
        // only listed calls can be executed
        // if not enabled only enable can be called.
        const availableCalls = isEnabled ? weblnCalls : disabledCalls;
        if (!availableCalls.includes(ev.data.action)) {
          console.error("Function not available. Is the provider enabled?");
          return;
        }

        const messageWithOrigin: MessageWebLNWithOrigin = {
          action: `webln/${ev.data.action}` as MessageWebLNWithOrigin["action"],
          args: ev.data.args,
          application: "LBE",
          public: true, // indicate that this is a public call from the content script
          prompt: true,
          origin: getOriginData(),
        };

        // Fixme: Response from Route Calls in background-script
        // fix what exactly?
        const replyFunction = (response: FixMe) => {
          callActive = false; // reset call is active
          // if it is the enable call we store if webln is enabled for this content script
          if (ev.data.action === "enable") {
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

        callActive = true;

        return browser.runtime
          .sendMessage(messageWithOrigin)
          .then(replyFunction)
          .catch(replyFunction);
      }
    }
  );
}

init();

export {};
