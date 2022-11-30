import browser from "webextension-polyfill";

import getOriginData from "./originData";
import shouldInject from "./shouldInject";

// Nostr calls that can be executed from the Nostr Provider.
// Update when new calls are added
const nostrCalls = [
  "nostr/getPublicKeyOrPrompt",
  "nostr/signEventOrPrompt",
  "nostr/getRelays",
  "nostr/enable",
];
let callActive = false;

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
      ev.data.scope !== "nostr"
    ) {
      return;
    }

    if (ev.data && !ev.data.response) {
      // if a call is active we ignore the request
      if (callActive) {
        console.error("nostr call already executing");
        return;
      }

      // limit the calls that can be made from window.nostr
      // only listed calls can be executed
      // if not enabled only enable can be called.
      if (!nostrCalls.includes(ev.data.action)) {
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
        window.postMessage(
          {
            application: "LBE",
            response: true,
            data: response,
            scope: "nostr",
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
