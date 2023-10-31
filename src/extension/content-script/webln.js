import browser from "webextension-polyfill";

import extractLightningData from "./batteries";
import getOriginData from "./originData";
import shouldInject from "./shouldInject";

// WebLN calls that can be executed from the WebLNProvider.
// Update when new calls are added
const weblnCalls = [
  "webln/enable",
  "webln/getInfo",
  "webln/lnurl",
  "webln/sendPaymentOrPrompt",
  "webln/sendPaymentAsyncWithPrompt",
  "webln/keysendOrPrompt",
  "webln/makeInvoice",
  "webln/signMessageOrPrompt",
  "webln/getBalanceOrPrompt",
  "webln/request",
  "webln/on",
  "webln/emit",
  "webln/off",
  "webln/isEnabled",
];
// calls that can be executed when webln is not enabled for the current content page
const disabledCalls = ["webln/enable", "webln/isEnabled"];

let isEnabled = false; // store if webln is enabled for this content page
let isRejected = false; // store if the webln enable call failed. if so we do not prompt again

async function init() {
  const inject = await shouldInject();
  if (!inject) {
    return;
  }

  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // extract LN data from websites
    if (request.action === "extractLightningData") {
      extractLightningData();
    }
    // forward account changed messaged to inpage script
    else if (request.action === "accountChanged" && isEnabled) {
      window.postMessage(
        { action: "accountChanged", scope: "webln" },
        window.location.origin
      );
    }
  });

  // message listener to listen to inpage webln/webbtc calls
  // those calls get passed on to the background script
  // (the inpage script can not do that directly, but only the inpage script can make webln available to the page)
  window.addEventListener("message", async (ev) => {
    // Only accept messages from the current window
    if (
      ev.source !== window ||
      ev.data.application !== "LBE" ||
      ev.data.scope !== "webln"
    ) {
      return;
    }

    if (ev.data && !ev.data.response) {
      // if an enable call railed we ignore the request to prevent spamming the user with prompts
      if (isRejected) {
        postMessage(ev, {
          error:
            "webln.enable() failed (rejecting further window.webln calls until the next reload)",
        });
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

      const messageWithOrigin = {
        // every call call is scoped in `public`
        // this prevents websites from accessing internal actions
        action: `public/${ev.data.action}`,
        args: ev.data.args,
        application: "LBE",
        public: true, // indicate that this is a public call from the content script
        prompt: true,
        origin: getOriginData(),
      };

      const replyFunction = (response) => {
        // if it is the enable call we store if webln is enabled for this content script
        if (ev.data.action === "webln/enable") {
          isEnabled = response.data?.enabled;
          const enabledEvent = new Event("webln:enabled");
          window.dispatchEvent(enabledEvent);
          if (response.error) {
            console.error(response.error);
            console.info("Enable was rejected ignoring further webln calls");
            isRejected = true;
          }
        }

        if (ev.data.action === "webln/isEnabled") {
          isEnabled = response.data?.isEnabled;
        }
        postMessage(ev, response);
      };
      return browser.runtime
        .sendMessage(messageWithOrigin)
        .then(replyFunction)
        .catch(replyFunction);
    }
  });
}

init();

function postMessage(ev, response) {
  window.postMessage(
    {
      id: ev.data.id,
      application: "LBE",
      response: true,
      data: response,
      scope: "webln",
    },
    window.location.origin
  );
}

export {};
