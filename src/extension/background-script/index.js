import browser from "webextension-polyfill";

import utils from "../../common/lib/utils";

import { router } from "./router";
import state from "./state";
import db from "./db";

import "./events"; // just load all files and register PubSub subscriptions

setInterval(() => {
  console.log(state.getState());
}, 5000);

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
const routeCalls = (message, sender) => {
  // if the application does not match or if it is not a prompt we ignore the call
  if (message.application !== "Joule" || !message.prompt) {
    return;
  }
  const debug = state.getState().settings.debug;

  const action = message.action || message.type; // TODO: what is a good message format to route to an action?
  console.log(`Routing call: ${action}`);
  // Potentially check for internal vs. public calls
  const call = router(action)(message, sender);

  // Log the action response if we are in debug mode
  if (debug) {
    call.then((r) => {
      console.log("Action response:", r);
      return r;
    });
  }
  return call;
};

async function init() {
  console.log("Loading background script");

  //await browser.storage.sync.set({ settings: { debug: true }, allowances: [] });
  await state.getState().init();
  console.log("State loaded");
  await db.open();

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
