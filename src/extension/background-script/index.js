import browser from "webextension-polyfill";

import utils from "../../common/lib/utils";

import { router } from "./router";
import state from "./state";

const debugLogger = (message, sender) => {
  if (state.getState().settings.debug) {
    console.log("Background onMessage: ", message, sender);
  }
};

const handleInstalled = (details) => {
  console.log(`Handle installed: ${details.reason}`);
  // TODO: maybe check if accounts are already configured?
  if (details.reason === "install") {
    utils.openUrl("welcome.html");
  }
};

// listen to calls from the content script and calls the actions through the router
// returns a promise to be handled in the content script
const routeCalls = (message, sender, sendResponse) => {
  // if the application does not match or if it is not a prompt we ignore the call
  if (message.application !== "Joule" || !message.prompt) {
    return Promise.resolve();
  }

  console.log(`Routing call: ${message.type}`);
  // Potentially check for internal vs. public calls
  const call = router(message.type)(message, sender);

  // Log the action response if we are in debug mode
  if (state.getState().settings.debug) {
    call.then((r) => {
      console.log("Action response:", r);
      return r;
    });
  }
  return call;
};

async function init() {
  console.log("Loading background script");

  await state.getState().init();
  console.log("State loaded");

  // initialize a connector for the current account
  browser.runtime.onMessage.addListener(debugLogger);
  // this is the only handler that may and must return a Promise which resolve with the response to the content script
  browser.runtime.onMessage.addListener(routeCalls);

  browser.runtime.onInstalled.addListener(handleInstalled);

  /*
  if (settings.enableLsats) {
    await browser.storage.sync.set({ lsats: {} });
    initLsatInterceptor(connector);
  }
  */
}

init();
