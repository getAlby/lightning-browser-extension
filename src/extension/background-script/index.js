import browser from "webextension-polyfill";

import utils from "../../common/lib/utils";

import { router } from "./router";
import state from "./state";
import db from "./db";
import connectors from "./connectors";

import * as events from "./events";

/* debug help to check the current state
setInterval(() => {
  console.log(state.getState());
}, 5000);
*/

const extractLightningData = (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url?.startsWith("http")) {
    browser.tabs.sendMessage(tabId, {
      type: "extractLightningData",
    });
  }
};

const updateIcon = async (tabId, changeInfo, tabInfo) => {
  if (changeInfo.status !== "complete" || !tabInfo.url?.startsWith("http")) {
    return;
  }
  const url = new URL(tabInfo.url);

  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(url.host)
    .first();

  // TODO: move to some config file
  const names = {
    active: "alby_icon_yellow",
    off: "alby_icon_sleeping",
  };
  let name;
  if (allowance) {
    name = names.active;
  } else {
    name = names.off;
  }
  return browser.browserAction.setIcon({
    path: {
      16: `assets/icons/${name}_16x16.png`,
      32: `assets/icons/${name}_32x32.png`,
      48: `assets/icons/${name}_48x48.png`,
      128: `assets/icons/${name}_128x128.png`,
    },
    tabId: tabId,
  });
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

  // TODO: make optional
  browser.tabs.onUpdated.addListener(updateIcon); // update Icon when there is an allowance

  // Notify the content script that the tab has been updated.
  browser.tabs.onUpdated.addListener(extractLightningData);

  if (state.getState().settings.debug) {
    console.log("Debug mode enabled, use window.debugAlby");
    window.debugAlby = {
      state,
      db,
      connectors,
      router,
    };
  }
}

// The onInstalled event is fired directly after the code is loaded.
// When we subscribe to that event asynchronously in the init() function it is too late and we miss the event.
browser.runtime.onInstalled.addListener(handleInstalled);

init();
