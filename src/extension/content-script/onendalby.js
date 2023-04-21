import browser from "webextension-polyfill";

import getOriginData from "./originData";
import shouldInject from "./shouldInject";

// Alby calls that can be executed from the AlbyProvider.
// Update when new calls are added
const albyCalls = ["alby/enable", "alby/addAccount"];
// calls that can be executed when alby is not enabled for the current content page
const disabledCalls = ["alby/enable"];

let isEnabled = false; // store if alby is enabled for this content page
let isRejected = false; // store if the alby enable call failed. if so we do not prompt again
let callActive = false; // store if a alby call is currently active. Used to prevent multiple calls in parallel

async function init() {
  const inject = await shouldInject();
  if (!inject) {
    return;
  }

  // message listener to listen to inpage alby calls
  // those calls get passed on to the background script
  // (the inpage script can not do that directly, but only the inpage script can make alby available to the page)
  window.addEventListener("message", (ev) => {
    // Only accept messages from the current window
    if (
      ev.source !== window ||
      ev.data.application !== "LBE" ||
      ev.data.scope !== "alby"
    ) {
      return;
    }

    if (ev.data && !ev.data.response) {
      // if an enable call railed we ignore the request to prevent spamming the user with prompts
      if (isRejected) {
        console.error(
          "Enable had failed. Rejecting further Alby calls until the next reload"
        );
        return;
      }
      // if a call is active we ignore the request
      if (callActive) {
        console.error("alby call already executing");
        return;
      }
      // limit the calls that can be made from alby
      // only listed calls can be executed
      // if not enabled only enable can be called.
      const availableCalls = isEnabled ? albyCalls : disabledCalls;
      if (!availableCalls.includes(ev.data.action)) {
        console.error(
          "Function not available. Is the provider enabled?",
          ev.data.action
        );
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
        // if it is the enable call we store if alby is enabled for this content script
        if (ev.data.action === "alby/enable") {
          isEnabled = response.data?.enabled;
          if (response.error) {
            console.error(response.error);
            console.info("Enable was rejected ignoring further alby calls");
            isRejected = true;
          }
        }
        window.postMessage(
          {
            application: "LBE",
            response: true,
            data: response,
            scope: "alby",
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
  });
}

init();

export {};
