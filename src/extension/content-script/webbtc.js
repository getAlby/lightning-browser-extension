import browser from "webextension-polyfill";

import { createScopePort } from "./messagePortServer";
import getOriginData from "./originData";
import shouldInject from "./shouldInject";
// WebBTC calls that can be executed from the WebBTC Provider.
// Update when new calls are added
const webbtcCalls = [
  "webbtc/enable",
  "webbtc/getInfo",
  "webbtc/signPsbtWithPrompt",
  "webbtc/getAddressOrPrompt",
  "webbtc/isEnabled",
  "webbtc/on",
  "webbtc/off",
];
// calls that can be executed when `window.webbtc` is not enabled for the current content page
const disabledCalls = ["webbtc/enable", "webbtc/isEnabled"];

let isEnabled = false; // store if webbtc is enabled for this content page
let isRejected = false; // store if the webbtc enable call failed. if so we do not prompt again

const SCOPE = "webbtc";

// Establish the private channel to the inpage world synchronously at
// document_start, before page scripts can register a competing listener. Only
// request servicing (below) is gated on the async should-inject decision.
const transport = createScopePort(SCOPE);

async function init() {
  const inject = await shouldInject();
  if (!inject) {
    return;
  }

  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // forward account changed messaged to inpage script
    if (request.action === "accountChanged" && isEnabled) {
      transport.sendEvent("accountChanged");
    }
  });

  // requests from the inpage webbtc provider arrive over the private port and
  // get passed on to the background script (the inpage script cannot do that
  // directly, but only the inpage script can make webbtc available to the page)
  transport.onRequest(async (data, reply) => {
    // if an enable call failed we ignore the request to prevent spamming the user with prompts
    if (isRejected) {
      console.error(
        "Enable had failed. Rejecting further WebBTC calls until the next reload"
      );
      return;
    }

    // limit the calls that can be made from window.webbtc
    // only listed calls can be executed
    // if not enabled only enable can be called.
    const availableCalls = isEnabled ? webbtcCalls : disabledCalls;
    if (!availableCalls.includes(data.action)) {
      console.error("Function not available.");
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
      if (data.action === `${SCOPE}/enable`) {
        isEnabled = response.data?.enabled;
        if (response.error) {
          console.error(response.error);
          console.info("Enable was rejected ignoring further webbtc calls");
          isRejected = true;
        }
      }

      if (data.action === `${SCOPE}/isEnabled`) {
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
