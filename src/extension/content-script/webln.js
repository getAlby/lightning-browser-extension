import browser from "webextension-polyfill";

import extractLightningData from "./batteries";
import { createScopePort } from "./messagePortServer";
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

// Establish the private channel to the inpage world synchronously at
// document_start, before page scripts can register a competing listener. Only
// request servicing (below) is gated on the async should-inject decision.
const transport = createScopePort("webln");

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
      transport.sendEvent("accountChanged");
    }
  });

  // requests from the inpage webln/webbtc provider arrive over the private port
  // and get passed on to the background script (the inpage script cannot do that
  // directly, but only the inpage script can make webln available to the page)
  transport.onRequest(async (data, reply) => {
    // if an enable call failed we ignore the request to prevent spamming the user with prompts
    if (isRejected) {
      reply({
        error:
          "webln.enable() failed (rejecting further window.webln calls until the next reload)",
      });
      return;
    }

    // limit the calls that can be made from webln
    // only listed calls can be executed
    // if not enabled only enable can be called.
    const availableCalls = isEnabled ? weblnCalls : disabledCalls;
    if (!availableCalls.includes(data.action)) {
      console.error("Function not available. Is the provider enabled?");
      return;
    }

    const messageWithOrigin = {
      // every call call is scoped in `public`
      // this prevents websites from accessing internal actions
      action: `public/${data.action}`,
      args: data.args,
      application: "LBE",
      public: true, // indicate that this is a public call from the content script
      prompt: true,
      origin: getOriginData(),
    };

    const replyFunction = (response) => {
      // if it is the enable call we store if webln is enabled for this content script
      if (data.action === "webln/enable") {
        isEnabled = response.data?.enabled;
        const enabledEvent = new Event("webln:enabled");
        window.dispatchEvent(enabledEvent);
        if (response.error) {
          console.error(response.error);
          console.info("Enable was rejected ignoring further webln calls");
          isRejected = true;
        }
      }

      if (data.action === "webln/isEnabled") {
        isEnabled = response.data?.isEnabled;
      }
      reply(response);
    };
    return browser.runtime
      .sendMessage(messageWithOrigin)
      .then(replyFunction)
      .catch(replyFunction);
  });
}

init();

export {};
