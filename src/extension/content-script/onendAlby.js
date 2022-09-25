import browser from "webextension-polyfill";
import getOriginData from "./originData";
import shouldInject from "./shouldInject";

// WebLN calls that can be executed from the WebLNProvider.
// Update when new calls are added
const albyCalls = [
  "alby/lnurl"
];

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
    if (ev.source !== window) {
      return;
    }
    if (ev.data && ev.data.application === "LBE" && !ev.data.response && ev.data.action.startsWith('alby')) {
    
      const messageWithOrigin = {
        action: `${ev.data.action}`, // every webln call must be scoped under `webln/` we do this to indicate that those actions are callable from the websites
        args: ev.data.args,
        application: "LBE",
        public: true, // indicate that this is a public call from the content script
        prompt: true,
        origin: getOriginData(),
      };
      const replyFunction = (response) => {
        window.postMessage(
          {
            application: "LBE",
            response: true,
            data: response,
            action: ev.data.action,
          },
          "*" // TODO use origin
        );
      };
      return browser.runtime
        .sendMessage(messageWithOrigin)
        .then(replyFunction)
        .catch(replyFunction);
    }
  });
}

init();

export {};
