import browser from "webextension-polyfill";

import { createScopePort } from "./messagePortServer";
import getOriginData from "./originData";
import shouldInject from "./shouldInject";

// Alby calls that can be executed from the AlbyProvider.
// Update when new calls are added
const albyCalls = ["alby/enable", "alby/addAccount", "alby/isEnabled"];
// calls that can be executed when alby is not enabled for the current content page
const disabledCalls = ["alby/enable", "alby/isEnabled"];

let isEnabled = false; // store if alby is enabled for this content page
let isRejected = false; // store if the alby enable call failed. if so we do not prompt again

// Establish the private channel to the inpage world synchronously at
// document_start, before page scripts can register a competing listener. Only
// request servicing (below) is gated on the async should-inject decision.
const transport = createScopePort("alby");

async function init() {
  const inject = await shouldInject();
  if (!inject) {
    return;
  }

  // requests from the inpage alby provider arrive over the private port and get
  // passed on to the background script (the inpage script cannot do that
  // directly, but only the inpage script can make alby available to the page)
  transport.onRequest((data, reply) => {
    // if an enable call failed we ignore the request to prevent spamming the user with prompts
    if (isRejected) {
      reply({
        error:
          "window.alby call cancelled (rejecting further window.alby calls until the next reload)",
      });
      return;
    }
    // limit the calls that can be made from window.alby
    // only listed calls can be executed
    // if not enabled only enable can be called.
    const availableCalls = isEnabled ? albyCalls : disabledCalls;
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
      // if it is the enable call we store if alby is enabled for this content script
      if (data.action === "alby/enable") {
        isEnabled = response.data?.enabled;
        if (response.error) {
          console.error(response.error);
          console.info("Enable was rejected ignoring further alby calls");
          isRejected = true;
        }
      }
      if (data.action === "alby/isEnabled") {
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
