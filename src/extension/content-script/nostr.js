import browser from "webextension-polyfill";

import { createScopePort } from "./messagePortServer";
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

// Establish the private channel to the inpage world synchronously at
// document_start, before page scripts can register a competing listener. Only
// request servicing (below) is gated on the async should-inject decision.
const transport = createScopePort("nostr");

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

  // requests from the inpage nostr provider arrive over the private port and get
  // passed on to the background script (the inpage script cannot do that
  // directly, but only the inpage script can make nostr available to the page)
  transport.onRequest(async (data, reply) => {
    // if an enable call failed we ignore the request to prevent spamming the user with prompts
    if (isRejected) {
      reply({
        error:
          "window.nostr call cancelled (rejecting further window.nostr calls until the next reload)",
      });
      return;
    }

    // limit the calls that can be made from window.nostr
    // only listed calls can be executed
    // if not enabled only enable can be called.
    const availableCalls = isEnabled ? nostrCalls : disabledCalls;
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

    // we don't handle onboard in content script. hence we will be resolving original call nostr/enable with an error hence we need reload the next time we execute the call
    const replyFunction = (response) => {
      if (data.action === "nostr/enable") {
        isEnabled = response.data?.enabled;
        if (response.error) {
          console.error(response.error);
          console.info("User rejected, ignoring further nostr calls");
          isRejected = true;
        }
      }
      if (data.action === "nostr/isEnabled") {
        isEnabled = response.data?.isEnabled;
      }

      if (response.denied) {
        reply({
          error: "permission denied",
        });
      } else {
        reply(response);
      }
    };

    return browser.runtime
      .sendMessage(messageWithOrigin)
      .then(replyFunction)
      .catch(replyFunction);
  });
}

init();

export {};
