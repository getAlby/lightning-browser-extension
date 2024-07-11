import browser from "webextension-polyfill";

import getOriginData from "./originData";
import shouldInject from "./shouldInject";

// Alby calls that can be executed from the AlbyProvider.
// Update when new calls are added
const albyCalls = ["alby/enable", "alby/addAccount", "alby/isEnabled"];
// calls that can be executed when alby is not enabled for the current content page
const disabledCalls = ["alby/enable", "alby/isEnabled"];

let isEnabled = false; // store if alby is enabled for this content page
let isRejected = false; // store if the alby enable call failed. if so we do not prompt again

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
        postMessage(ev, {
          error:
            "window.alby call cancelled (rejecting further window.alby calls until the next reload)",
        });
        return;
      }
      // limit the calls that can be made from window.alby
      // only listed calls can be executed
      // if not enabled only enable can be called.
      const availableCalls = isEnabled ? albyCalls : disabledCalls;
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
        // if it is the enable call we store if alby is enabled for this content script
        if (ev.data.action === "alby/enable") {
          isEnabled = response.data?.enabled;
          if (response.error) {
            console.error(response.error);
            console.info("Enable was rejected ignoring further alby calls");
            isRejected = true;
          }
        }
        if (ev.data.action === "alby/isEnabled") {
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

function postMessage(ev, response) {
  window.postMessage(
    {
      id: ev.data.id,
      application: "LBE",
      response: true,
      data: response,
      scope: "alby",
    },
    window.location.origin
  );
}

init();

export {};
