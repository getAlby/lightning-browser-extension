import browser from 'webextension-polyfill';

import Connector from '../lib/connector';

const connector = new Connector();
const DEBUG = true;

// listen to calls from the content script and pass it on to the native application
// returns a promise to be handled in the content script
browser.runtime.onMessage.addListener((message, sender) => {
  if (DEBUG) {
    console.log('Background onMessage: ', message, sender);
  }
  // if the application does not match or if it is not a prompt we ignore the call
  if (message.application !== 'Joule' || !message.prompt) {
    return false;
  }

  const call = connector[message.type]({args: message.args, origin: message.origin});
  if (DEBUG) {
    call.then(r => {
      console.log('Connector response:', r);
      return r
    })
  }
  return call;
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
