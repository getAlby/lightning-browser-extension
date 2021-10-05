import browser from "webextension-polyfill";

import utils from "../../common/lib/utils";

import { router } from "./router";
import state from "./state";
import db from "./db";

import * as events from "./events";

/* debug help to check the current state
setInterval(() => {
  console.log(state.getState());
}, 5000);
*/

const extractLightningDataFromPage = async (tabId, changeInfo, tabInfo) => {
  if (changeInfo.status !== "complete") {
    return;
  }

  browser.tabs.executeScript(tabId, {
    code: "if ((document.location.protocol === 'https:' || document.location.protocol === 'http:') && window.LBE_EXTRACT_LIGHTNING_DATA) { LBE_EXTRACT_LIGHTNING_DATA(); };",
  });
};

const updateIcon = async (tabId, changeInfo, tabInfo) => {
  if (!changeInfo.url || !changeInfo.url.startsWith("http")) {
    return;
  }
  const url = new URL(changeInfo.url);

  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(url.host)
    .first();

  if (allowance) {
    return browser.browserAction.setIcon({
      path: {
        16: "assets/icons/satsymbol-16.png",
        32: "assets/icons/satsymbol-32.png",
        48: "assets/icons/satsymbol-48.png",
        128: "assets/icons/satsymbol-128.png",
      },
      tabId: tabId,
    });
  }
};

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
  if (message.application !== "LBE" || !message.prompt) {
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
      console.log(`${action} response:`, r);
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

  events.subscribe();

  // initialize a connector for the current account
  browser.runtime.onMessage.addListener(debugLogger);
  // this is the only handler that may and must return a Promise which resolve with the response to the content script
  browser.runtime.onMessage.addListener(routeCalls);

  browser.tabs.onUpdated.addListener(updateIcon); // update Icon when there is an allowance
  // TODO: make optional
  browser.tabs.onUpdated.addListener(extractLightningDataFromPage); // extract LN data from websites
  /*
  if (settings.enableLsats) {
    await browser.storage.sync.set({ lsats: {} });
    initLsatInterceptor(connector);
  }
  */
}

// The onInstalled event is fired directly after the code is loaded.
// When we subscribe to that event asynchronously in the init() function it is too late and we miss the event.
browser.runtime.onInstalled.addListener(handleInstalled);

init();
