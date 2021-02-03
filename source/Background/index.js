import browser from 'webextension-polyfill';

import connectors from '../lib/connectors';

let connector;

browser.storage.sync.get(['currentAccount', 'accounts', 'settings']).then(result => {

  browser.storage.sync.set({currentAccount: 'joule'});
  /*
  browser.storage.sync.set({
    accounts: {
      lndt: {
        config: {
          macaroon: '',
          url: ''
        },
        connector: 'lnd'
      },
      joule: {
        config: {},
        connector: 'native'
      }
    },
    currentAccount: 'lndt'
  });
  */

  console.log(result);

  const settings = result.settings || {};
  const account = result.accounts[result.currentAccount];

  if (account.connector) {
    connector = new connectors[account.connector](account.config);
  } else {
    connector = new connectors.native(account.config);
  }

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


// provider.getInfo()
//   .then(info => console.log(info))
//   .catch(e => console.log(e));

//connector.signMessage({args: {message: 'hallo'}, origin: {}})
// provider.makeInvoice()
//  .then(invoice => console.log(invoice))
//  .catch(e => console.log(e))

// function send(data) {
//   return new Promise((resolve, reject) => {
//     let sending = browser.runtime.sendNativeMessage(hostName, data);
//     sending.then(resolve, reject);
//   });
// }
