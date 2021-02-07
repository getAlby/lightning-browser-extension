import browser from "webextension-polyfill";

import Settings from "../lib/settings";
import connectors from "../lib/connectors";

let connector;
let settings;
let currentUnlockPassword; // TODO: rethink this

const initConnector = async () => {
  return browser.storage.sync
    .get(["currentAccount", "accounts"])
    .then((result) => {
      const account = result.accounts[result.currentAccount];
      if (!account) {
        return Promise.reject("No account");
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
    });
};

browser.storage.onChanged.addListener((changes) => {
  if (changes.accounts || changes.currentAccount) {
    initConnector();
  }
  if (changes.settings) {
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

  const call = connector[message.type]({
    args: message.args,
    origin: message.origin,
  });
  if (settings.debug) {
    call.then((r) => {
      console.log("Connector response:", r);
      return r;
    });
  }
  return call;
};

const handleUnlocks = (message, sender) => {
  // If it is an unlock request we use it to decrypt the encrypted config in the connector
  if (message.application !== "Joule" || !message.unlock) {
    return;
  }
  if (settings && settings.debug) {
    console.log("Unlocking");
  }
  currentUnlockPassword = message.unlock;
  if (connector) {
    connector.unlock(message.unlock);
  }
};

async function init() {
  // load the settings
  settings = await new Settings();
  await settings.load();
  // initialize a connector for the current account
  await initConnector();
  browser.runtime.onMessage.addListener(debugLogger);
  // this is the only handler that may and must return a Promise which resolve with the response to the content script
  browser.runtime.onMessage.addListener(handleConnectorCalls);
  browser.runtime.onMessage.addListener(handleUnlocks);
}

init();
