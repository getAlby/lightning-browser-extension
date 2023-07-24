import browser from "webextension-polyfill";

import getOriginData from "./originData";
import shouldInject from "./shouldInject";

// Liquid calls that can be executed from the Liquid Provider.
// Update when new calls are added
const liquidCalls = [
  "liquid/getAddressOrPrompt",
  "liquid/signPsetWithPrompt",
  "liquid/enable",
];
// calls that can be executed when liquid is not enabled for the current content page
const disabledCalls = ["liquid/enable"];

let isEnabled = false; // store if liquid is enabled for this content page
let isRejected = false; // store if the liquid enable call failed. if so we do not prompt again
let callActive = false; // store if a lqiuid call is currently active. Used to prevent multiple calls in parallel

const SCOPE = "liquid";

async function init() {
  const inject = await shouldInject();
  if (!inject) {
    return;
  }

  // message listener to listen to inpage webln calls
  // those calls get passed on to the background script
  // (the inpage script can not do that directly, but only the inpage script can make webln available to the page)
  window.addEventListener("message", (ev) => {
    // Only accept messages from the current window
    if (
      ev.source !== window ||
      ev.data.application !== "LBE" ||
      ev.data.scope !== SCOPE
    ) {
      return;
    }

    if (ev.data && !ev.data.response) {
      // if an enable call railed we ignore the request to prevent spamming the user with prompts
      if (isRejected) {
        console.error(
          "Enable had failed. Rejecting further Liquid calls until the next reload"
        );
        return;
      }
      // if a call is active we ignore the request
      if (callActive) {
        console.error("liquid call already executing");
        return;
      }

      // limit the calls that can be made from window.liquid
      // only listed calls can be executed
      // if not enabled only enable can be called.
      const availableCalls = isEnabled ? liquidCalls : disabledCalls;
      if (!availableCalls.includes(ev.data.action)) {
        console.error("Function not available.");
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

        if (ev.data.action === `${SCOPE}/enable`) {
          isEnabled = response.data?.enabled;
          if (response.error) {
            console.error(response.error);
            console.info("Enable was rejected ignoring further liquid calls");
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
      scope: SCOPE,
    },
    "*"
  );
}

export {};
