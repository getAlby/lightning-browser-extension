import browser from "webextension-polyfill";

import extractLightningData from "./batteries";
import injectScript from "./injectScript";
import getOriginData from "./originData";
import shouldInject from "./shouldInject";

// WebLN calls that can be executed from the WebLNProvider.
// Update when new calls are added
const weblnCalls = [
  "webln/enable",
  "webln/getInfo",
  "webln/lnurl",
  "webln/sendPaymentOrPrompt",
  "webln/keysendOrPrompt",
  "webln/makeInvoice",
  "webln/signMessageOrPrompt",
  "webln/request",
];
// calls that can be executed when webln is not enabled for the current content page
const disabledCalls = ["webln/enable"];

let isEnabled = false; // store if webln is enabled for this content page
let isRejected = false; // store if the webln enable call failed. if so we do not prompt again
let callActive = false; // store if a webln call is currently active. Used to prevent multiple calls in parallel

async function init() {
  const inject = await shouldInject();
  if (!inject) {
    return;
  }

  injectScript(browser.runtime.getURL("js/inpageScript.bundle.js")); // registers the DOM event listeners and checks webln again (which is also loaded onstart

  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // extract LN data from websites
    if (request.action === "extractLightningData") {
      extractLightningData();
    }
    // forward account switched messages to the website
    else if (request.action === "accountSwitched") {
      window.postMessage("accountSwitched", "*");
    }
  });

  // message listener to listen to inpage webln/webbtc calls
  // those calls get passed on to the background script
  // (the inpage script can not do that directly, but only the inpage script can make webln available to the page)
  window.addEventListener("message", (ev) => {
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
      // if a call is active we ignore the request
      if (callActive) {
        postMessage(ev, { error: "window.webln call already executing" });
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
        callActive = false; // reset call is active
        // if it is the enable call we store if webln is enabled for this content script
        if (ev.data.action === "webln/enable") {
          isEnabled = response.data?.enabled;
          if (response.error) {
            console.error(response.error);
            console.info("Enable was rejected ignoring further webln calls");
            isRejected = true;
          }
        }
        postMessage(ev, response);
      };
      callActive = true;
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
    "*"
  );
}

export {};
