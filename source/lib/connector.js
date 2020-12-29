import browser from 'webextension-polyfill';

const nativeApplication = 'joule';

export default class Connector {

  constructor () {
    this.isExecuting = false;
  }
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

  connect () {
    this.port = browser.runtime.connectNative(nativeApplication);
  }

  disconnect () {
    this.port.disconnect();
  }

  call (command, args) {
    if (this.isExecuting) {
      return Promise.resolve({error: 'User is busy'});
    }
    this.isExecuting = true;
    return new Promise((resolve, reject) => {
      const data = {command, ...args};
      browser.runtime.sendNativeMessage(nativeApplication, data)
        .then(response => {
          this.isExecuting = false;
          return resolve(response);
        })
        .catch(error => {
          this.isExecuting = false;
          console.log('Connector call failed: ', error);
          return resolve({error: `Error: probably rejected by user: ${error.message}`});
        })
    });
  }
}
