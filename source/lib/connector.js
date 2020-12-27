import browser from 'webextension-polyfill';

export default class Connector {

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

  call (command, args) {
    return new Promise((resolve, reject) => {
      const catchReject = (error) => {
        console.log('Connector call failed: ', error);
        reject(new Error('Error: probably rejected by user'));
      }
      const data = {command, ...args};
      let sending = browser.runtime.sendNativeMessage('joule', data);
      sending.then(resolve, catchReject);
    });
  }
}
