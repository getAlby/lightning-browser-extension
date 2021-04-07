import memoizee from "memoizee";
import browser from "webextension-polyfill";

const nativeApplication = "joule";

export default class Native {
  constructor(config) {
    this.isExecuting = false;
    this.getInfo = memoizee((args) => this.call("getInfo", args), {
      promise: true,
      maxAge: 20000,
      preFetch: true,
      normalizer: () => "getinfo",
    });
    this.enable = memoizee((args) => this.call("enable", args), {
      promise: true,
      maxAge: 20000,
      preFetch: true,
      normalizer: () => "enable",
    });
  }

  async init() {
    return Promise.resolve();
  }

  // webln calls

  makeInvoice(args) {
    return this.call("makeInvoice", args);
  }

  signMessage(args) {
    return this.call("signMessage", args);
  }

  sendPayment(args) {
    return this.call("sendPayment", args);
  }

  // non webln calls

  open(args) {
    return this.call("home", args);
  }

  setup(args) {
    return this.call("setup", args);
  }

  settings(args) {
    return this.call("settings", args);
  }

  connect() {
    this.port = browser.runtime.connectNative(nativeApplication);
  }

  disconnect() {
    this.port.disconnect();
  }

  call(command, args) {
    if (this.isExecuting) {
      return Promise.resolve({ error: "User is busy" });
    }
    this.isExecuting = true;
    return new Promise((resolve, reject) => {
      const data = { command, ...args };
      browser.runtime
        .sendNativeMessage(nativeApplication, data)
        .then((response) => {
          this.isExecuting = false;
          return resolve(response);
        })
        .catch((error) => {
          this.isExecuting = false;
          console.log("Connector call failed: ", error);
          return resolve({
            error: `Error: probably rejected by user: ${error.message}`,
          });
        });
    });
  }
}
