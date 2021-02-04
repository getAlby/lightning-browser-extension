import browser from 'webextension-polyfill';

import connectors from '../lib/connectors';

let connector;
let settings;

const initConnector = async () => {
  return browser.storage.sync.get(['currentAccount', 'accounts']).then((result) => {
    const account = result.accounts[result.currentAccount];
    // TODO: check if an account is configured. Guess this also needs to be done on a different level to make sure we display a settings page if nothing is configured.
    if (account.connector) {
      connector = new connectors[account.connector](account.config);
    } else {
      connector = new connectors.native(account.config);
    }

    return connector.init();
  });
}

browser.storage.onChanged.addListener((changes) => {
  if (changes.currentAccount) {
    initConnector();
  }
  if (changes.settings) {
    settings = changes.settings.newValue;
  }
});

browser.storage.sync.get(['currentAccount', 'accounts', 'settings']).then(async (result) => {
  settings = result.settings || {};
  await initConnector();

  // listen to calls from the content script and pass it on to the native application
  // returns a promise to be handled in the content script
  browser.runtime.onMessage.addListener((message, sender) => {
    if (settings.debug) {
      console.log('Background onMessage: ', message, sender);
    }
    // if the application does not match or if it is not a prompt we ignore the call
    if (message.application !== 'Joule' || !message.prompt) {
      return false;
    }

    const call = connector[message.type]({args: message.args, origin: message.origin});
    if (settings.debug) {
      call.then(r => {
        console.log('Connector response:', r);
        return r
      })
    }
    return call;
  });
});