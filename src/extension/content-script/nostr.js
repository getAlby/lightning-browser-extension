import browser from "webextension-polyfill";

import getOriginData from "./originData";
import shouldInject from "./shouldInject";

// Nostr calls that can be executed from the Nostr Provider.
// Update when new calls are added
const nostrCalls = [
  "nostr/getPublicKeyOrPrompt",
  "nostr/signEventOrPrompt",
  "nostr/signSchnorrOrPrompt",
  "nostr/enable",
  "nostr/encryptOrPrompt",
  "nostr/decryptOrPrompt",
  "nostr/nip44EncryptOrPrompt",
  "nostr/nip44DecryptOrPrompt",
  "nostr/on",
  "nostr/off",
  "nostr/emit",
  "nostr/isEnabled",
];
// calls that can be executed when nostr is not enabled for the current content page
const disabledCalls = ["nostr/enable", "nostr/isEnabled"];

let isEnabled = false; // store if nostr is enabled for this content page
let isRejected = false; // store if the nostr enable call failed. if so we do not prompt again

async function init() {
  const inject = await shouldInject();
  if (!inject) {
    return;
  }

  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // forward account changed messaged to inpage script
    if (request.action === "accountChanged" && isEnabled) {
      window.postMessage(
        { action: "accountChanged", scope: "nostr" },
        window.location.origin
      );
    }
  });

  // message listener to listen to inpage nostr calls
  // those calls get passed on to the background script
  // (the inpage script can not do that directly, but only the inpage script can make nostr available to the page)
  window.addEventListener("message", async (ev) => {
    // Only accept messages from the current window
    if (
      ev.source !== window ||
      ev.data.application !== "LBE" ||
      ev.data.scope !== "nostr"
    ) {
      return;
    }

    if (ev.data && !ev.data.response) {
      // if an enable call railed we ignore the request to prevent spamming the user with prompts
      if (isRejected) {
        postMessage(ev, {
          error:
            "window.nostr call cancelled (rejecting further window.nostr calls until the next reload)",
        });
        return;
      }

      // limit the calls that can be made from window.nostr
      // only listed calls can be executed
      // if not enabled only enable can be called.
      const availableCalls = isEnabled ? nostrCalls : disabledCalls;
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

      // we don't handle onboard in content script. hence we will be resolving original call nostr/enable with an error hence we need reload the next time we execute the call
      const replyFunction = (response) => {
        if (ev.data.action === "nostr/enable") {
          isEnabled = response.data?.enabled;
          if (response.error) {
            console.error(response.error);
            console.info("User rejected, ignoring further nostr calls");
            isRejected = true;
          }
        }
        if (ev.data.action === "nostr/isEnabled") {
          isEnabled = response.data?.isEnabled;
        }

        if (response.denied) {
          postMessage(ev, {
            error: "permission denied",
          });
        } else {
          postMessage(ev, response);
        }
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
      scope: "nostr",
    },
    window.location.origin
  );
}

init();

export {};
