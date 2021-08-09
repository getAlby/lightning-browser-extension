import browser from "webextension-polyfill";

import utils from "../../common/lib/utils";

import { router } from "./router";
import state from "./state";
import db from "./db";

import * as events from "./events";

import "./wasm_exec.js";

const wasmURL = browser.extension.getURL("assets/wasm-demo.wasm");

const go = new Go();
let mod, inst;
WebAssembly.instantiateStreaming(fetch(wasmURL), go.importObject)
  .then((result) => {
    mod = result.module;
    inst = result.instance;
    run();
  })
  .catch((err) => {
    console.error(err);
  });

async function run() {
  console.log("RUN");
  go.argv = ["wasm-demo", "--debuglevel=trace"];
  await go.run(inst); // this resolves once the program exits?!
  inst = await WebAssembly.instantiate(mod, go.importObject); // reset instance
}

setTimeout(() => {
  console.log(
    demoDecodeInvoice(
      "lnbc1500n1pssc9wkpp5x3p7cys9vk6pfvsrl9flraasny304uqfjhut00hqgvp9v42u42eqdpa2fjkzep6ypyx7aeqw3hjqsmfwf3h2mrpwgs9yetzv9kxzmnrv5s8wteqgfskccqzpgxqr23ssp5vw3llna7c9xngl5wwfflr6czn39t39ks8czkv7hfju2vs2u2ce8s9qyyssq5zgr9khymuqgkxuwz0ulreth0kxdreewmmuvvw2kn74a8xdfelsk9q5z5fnxy2rkdpwyldxnkse5pmfpxsdvfw6m7ffstzhf4ahzhjgqm6avmd"
    )
  );
  console.log(demoGenerateAezeed());
}, 2000);

/* debug help to check the current state
setInterval(() => {
  console.log(state.getState());
}, 5000);
*/

const updateIcon = async (tabId, changeInfo, tabInfo) => {
  if (!changeInfo.url) {
    return;
  }
  if (!changeInfo.url.startsWith("http")) {
    return;
  }
  const url = new URL(changeInfo.url);

  const allowance = await db.allowances
    .where("host")
    .equalsIgnoreCase(url.host)
    .first();

  if (allowance) {
    return browser.browserAction.setIcon({
      path: "assets/icons/satsymbol.svg",
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

  browser.runtime.onInstalled.addListener(handleInstalled);

  browser.tabs.onUpdated.addListener(updateIcon);
  /*
  if (settings.enableLsats) {
    await browser.storage.sync.set({ lsats: {} });
    initLsatInterceptor(connector);
  }
  */
}

init();
