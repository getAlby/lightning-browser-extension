import browser from "webextension-polyfill";
import utils from "../../common/lib/utils";
import Settings from "../../common/lib/settings";
import Accounts from "../../common/lib/accounts";
import Allowances from "../../common/lib/allowances";
import connectors from "./connectors";

import initLsatInterceptor from "./lsatInterceptor";

let currentUnlockPassword; // TODO: rethink this
let connector;
let accounts = new Accounts();
let settings = new Settings();
let allowances = new Allowances();

const initConnector = async () => {
  await accounts.load(); // load latest accounts from storage
  const account = accounts.current;
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
  // refresh allowances
  if (changes.allowances) {
    // load the allowances and update the browser action icon with new details (e.g. updated amount)
    allowances.load().then(updateIcon);
  }
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
  if (!connector) {
    console.log("No connector/account found");
    utils.openPage("options.html");
    return Promise.resolve({ error: "No account available" });
  }

  // check for internal vs. public calls
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

const updateIcon = (_) => {
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    const currentTab = tabs[0];
    // check if we have a tab and that we also can access the url (we get called for all tabs but we only get the URL for the current tab)
    if (!currentTab || !currentTab.url) {
      return;
    }
    // only check for pages that start with http/https
    if (!currentTab.url.startsWith("http")) {
      return;
    }
    const allowance = allowances.getAllowance(currentTab.url);
    console.log(allowance);
    if (allowance.budget > 0) {
      browser.browserAction.setBadgeText({
        text: `${allowance.budgetLeft}`,
        tabId: currentTab.id,
      });
      browser.browserAction.setTitle({
        title: `Allowance enabled: ${allowance.budgetLeft} Satoshis left`,
        tabId: currentTab.id,
      });
    }
  });
};

async function init() {
  console.log("Loading background script");
  await settings.load();
  await accounts.load();
  await allowances.load();

  // initialize a connector for the current account
  await initConnector();
  browser.runtime.onMessage.addListener(debugLogger);
  // this is the only handler that may and must return a Promise which resolve with the response to the content script
  browser.runtime.onMessage.addListener(handleConnectorCalls);

  browser.runtime.onInstalled.addListener(handleInstalled);

  // Update extension icon depending on the allowance setting for the current tab
  // listen to tab URL changes
  browser.tabs.onUpdated.addListener(updateIcon);
  // listen to tab switching
  browser.tabs.onActivated.addListener(updateIcon);
  // listen for window switching
  browser.windows.onFocusChanged.addListener(updateIcon);

  if (settings.enableLsats) {
    await browser.storage.sync.set({ lsats: {} });
    initLsatInterceptor(connector);
  }
}

init();
