import { message } from "antd";

export default class WebLNProvider {
  constructor() {
    this.isEnabled = false;
    this.isExecuting = false;
  }

  enable() {
    if (this.isEnabled) {
      return Promise.resolve({ enabled: true });
    }
    return this.execute("enable").then((result) => {
      this.isEnabled = result.enabled;
      return result;
    });
  }

  getInfo() {
    if (!this.isEnabled) {
      throw new Error("Provider must be enabled before calling getInfo");
    }
    return this.execute("getInfo");
  }

  sendPayment(paymentRequest) {
    if (!this.isEnabled) {
      throw new Error("Provider must be enabled before calling sendPayment");
    }
    return this.execute("sendPayment", { paymentRequest });
  }

  makeInvoice(args) {
    if (!this.isEnabled) {
      throw new Error("Provider must be enabled before calling makeInvoice");
    }
    if (typeof args !== "object") {
      args = { amount: args };
    }

    return this.execute("makeInvoice", args);
  }

  signMessage(message) {
    if (!this.isEnabled) {
      throw new Error("Provider must be enabled before calling signMessage");
    }

    return this.execute("signMessage", { message });
  }

  execute(type, args) {
    return new Promise((resolve, reject) => {
      // post the request to the content script. from there it gets passed to the background script and back
      // in page script can not directly connect to the background script
      window.postMessage(
        {
          application: "Joule",
          prompt: true,
          type,
          args,
        },
        "*"
      );

      function handleWindowMessage(messageEvent) {
        // check if it is a relevant message
        // there are some other events happening
        if (
          !messageEvent.data ||
          !messageEvent.data.response ||
          messageEvent.data.application !== "Joule"
        ) {
          return;
        }
        if (messageEvent.data.data.error) {
          reject(messageEvent.data.data.error);
        } else {
          console.log(messageEvent);
          console.log(messageEvent.data);
          // 1. data: the message data
          // 2. data: the data passed as data to the message
          // 3. data: the actual response data
          resolve(messageEvent.data.data.data);
        }
        // For some reason must happen only at the end of this function
        window.removeEventListener("message", handleWindowMessage);
      }

      window.addEventListener("message", handleWindowMessage);
    });
  }
}
