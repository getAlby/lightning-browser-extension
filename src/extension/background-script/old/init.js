import browser from "webextension-polyfill";
import utils from "../../../common/lib/utils";
import Settings from "../../../common/lib/settings";
import accountSvc from "../../../common/services/account.svc";
import connectors from "../connectors";

import initLsatInterceptor from "./lsatInterceptor";

let currentUnlockPassword; // TODO: rethink this
let connector;
let settings = new Settings();
const initConnector = async () => {
  const account = await accountSvc.getCurrentAccount();
  console.log(account);
  if (!account) {
    console.log("Account not found");
    return;
  }
  connector = new connectors[account.connector](account.config);

  if (currentUnlockPassword) {
    connector.unlock(currentUnlockPassword);
  }

  return connector.init();
};

browser.storage.onChanged.addListener((changes) => {
  // if the accounts change we initialize a new connector
  // this also requires the user to unlock the account again
  if (changes.accounts) {
    initConnector();
  }
  // Update the general settings in the current connector settings
  if (connector && changes.settings) {
    connector.init();
  }
  // TODO: what to do with allowances?
});

const debugLogger = (message, sender) => {
  if (settings && settings.debug) {
    console.log("Background onMessage: ", message, sender);
  }
};

const handleInstalled = (details) => {
  console.log("handle installed");
  // TODO: maybe check if accounts are already configured?
  if (details.reason === "install") {
    utils.openUrl("welcome.html");
  }
};

// listen to calls from the content script and pass it on to the native application
// returns a promise to be handled in the content script
const handleConnectorCalls = (message, sender, sendResponse) => {
  // if the application does not match or if it is not a prompt we ignore the call
  if (message.application !== "Joule" || !message.prompt) {
    return Promise.resolve();
  }

  // if the connector is not available, probably because no account is configured we open the Options page.
  // TODO: create an onboarding wizard
  // if (!connector) {
  //   console.log("No connector/account found");
  //   utils.openPage("options.html");
  //   return Promise.resolve({ error: "No account available" });
  // }

  //  check for internal vs. public calls
  const call = connector[message.type]({
    args: message.args,
    origin: message.origin,
    type: message.type,
  });
  if (settings.debug) {
    call.then((r) => {
      console.log("Connector response:", r);
      return r;
    });
  }
  return call;
};

async function init() {
  console.log("Loading background script");
  await settings.load();
  // await accounts.load();
  // initialize a connector for the current account
  await initConnector();
  browser.runtime.onMessage.addListener(debugLogger);
  // this is the only handler that may and must return a Promise which resolve with the response to the content script
  browser.runtime.onMessage.addListener(handleConnectorCalls);

  browser.runtime.onInstalled.addListener(handleInstalled);

  if (settings.enableLsats) {
    await browser.storage.sync.set({ lsats: {} });
    initLsatInterceptor(connector);
  }
}

export default init;
