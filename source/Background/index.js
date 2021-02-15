import browser from "webextension-polyfill";

import utils from "../lib/utils";
import Settings from "../lib/settings";
import connectors from "../lib/connectors";

let connector;
let settings;
let currentUnlockPassword; // TODO: rethink this

const initConnector = async () => {
  const args = await browser.storage.sync.get(["currentAccount", "accounts"]);
  const account = args.accounts[args.currentAccount];
  if (!account) {
    // reset existing connector instance and return
    connector = null;
    return Promise.resolve("No account");
  }
  // TODO: check if an account is configured. Guess this also needs to be done on a different level to make sure we display a settings page if nothing is configured.
  if (account.connector) {
    connector = new connectors[account.connector](account.config);
  } else {
    connector = new connectors.native(account.config);
  }

  if (currentUnlockPassword) {
    connector.unlock(currentUnlockPassword);
  }

  return connector.init();
};

browser.storage.onChanged.addListener((changes) => {
  // if the accounts change we initialize a new connector
  // this also requires the user to unlock the account again
  if (changes.accounts || changes.currentAccount) {
    initConnector();
  }
  // Update the hostsettings in the current connector settings
  if (changes.hostSettings) {
    connector.settings.hostSettings = changes.hostSettings.newValue || {};
  }
  // Update the general settings in the current connector settings
  if (changes.settings) {
    connector.settings.settings = changes.settings.newValue || {};
    settings = changes.settings.newValue;
  }
});

const debugLogger = (message, sender) => {
  if (settings && settings.debug) {
    console.log("Background onMessage: ", message, sender);
  }
};

// listen to calls from the content script and pass it on to the native application
// returns a promise to be handled in the content script
const handleConnectorCalls = (message, sender) => {
  // if the application does not match or if it is not a prompt we ignore the call
  if (message.application !== "Joule" || !message.prompt) {
    return Promise.resolve();
  }

  // if the connector is not available, probably because no account is configured we open the Options page.
  // TODO: create an onboarding wizard
  if (!connector) {
    console.log("No connector/account found");
    utils.openPage("Options.html");
    return Promise.resolve({ error: "No account available" });
  }

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
  settings = new Settings();
  await settings.load();
  // initialize a connector for the current account
  await initConnector();
  browser.runtime.onMessage.addListener(debugLogger);
  // this is the only handler that may and must return a Promise which resolve with the response to the content script
  browser.runtime.onMessage.addListener(handleConnectorCalls);
}

init();
