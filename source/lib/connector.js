import browser from 'webextension-polyfill';

export default class Connector {

  // webln calls

  enable(args) {
    return this.call('enable', args);
  }

  getInfo(args) {
    return this.call('getInfo', args);
  }

  makeInvoice(args) {
    return this.call('makeInvoice', args);
  }

  signMessage(args) {
    return this.call('signMessage', args);
  }

  sendPayment(args) {
    return this.call('sendPayment', args);
  }

  // non webln calls

  open(args) {
    console.log('open');
    return this.call('home', args);
  }

  settings(args) {
    return this.call('settings', args);
  }

  call (command, args) {
    return new Promise((resolve, reject) => {
      const catchReject = (error) => {
        console.log('Connector call failed: ', error);
        resolve({error: `Error: probably rejected by user: ${error.message}`});
      }
      const data = {command, ...args};
      let sending = browser.runtime.sendNativeMessage('joule', data);
      sending.then(resolve).catch(catchReject);
    });
  }
}
