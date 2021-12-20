import browser from "webextension-polyfill";

const nativeApplication = "alby";

export default class Native {
  constructor(config) {
  }

  send(message) {
    console.log(`Sending to native app: ${message}`);
    browser.runtime.sendNativeMessage(nativeApplication, message).then((response) => {
      console.log("native response:");
      console.log(response);
    }).catch((e) => {
      console.log('native error');
      console.log(e);
    });
  }

  connectPort() {
    this.port = browser.runtime.connectNative(nativeApplication);
    this.port.onMessage.addListener((response) => {
      console.log("Native message received: " + response);
    });
  }

  async init() {
    return Promise.resolve();
  }

}
