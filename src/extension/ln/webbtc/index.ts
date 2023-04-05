type RequestInvoiceArgs = {
  amount?: string | number;
  defaultAmount?: string | number;
  minimumAmount?: string | number;
  maximumAmount?: string | number;
  defaultMemo?: string;
};

declare global {
  interface Window {
    webbtc: WebBTCProvider;
  }
}

interface Requests {
  [key: string]: {
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  };
}

export default class WebBTCProvider {
  enabled: boolean;
  isEnabled: boolean;
  executing: boolean;
  _requests: Requests;

  constructor() {
    this.enabled = false;
    this.isEnabled = false;
    this.executing = false;
    this._requests = {};
  }

  enable() {
    if (this.enabled) {
      return Promise.resolve({ enabled: true });
    }
    return this.execute("enable").then((result) => {
      if (typeof result.enabled === "boolean") {
        this.enabled = result.enabled;
        this.isEnabled = result.enabled;
      }
      return result;
    });
  }

  getInfo() {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling getInfo");
    }
    return this.execute("getInfo");
  }

  signMessage(message: string) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling signMessage");
    }

    return this.execute("signMessageOrPrompt", { message });
  }

  verifyMessage(signature: string, message: string) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling verifyMessage");
    }
    throw new Error("Alby does not support `verifyMessage`");
  }

  makeInvoice(args: string | number | RequestInvoiceArgs) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling makeInvoice");
    }
    if (typeof args !== "object") {
      args = { amount: args };
    }

    return this.execute("makeInvoice", args);
  }

  sendPayment(paymentRequest: string) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling sendPayment");
    }
    return this.execute("sendPaymentOrPrompt", { paymentRequest });
  }

  sendTransaction(address: string, amount: string) {
    if (!this.enabled) {
      throw new Error(
        "Provider must be enabled before calling sendTransaction"
      );
    }
    throw new Error("Alby does not support `sendTransaction`");
  }

  getAddress(index: number, num: number, change: boolean) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling getAddress");
    }
    throw new Error("Alby does not support `getAddress`");
  }

  request(method: string, params: Record<string, unknown>) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling request");
    }

    return this.execute("request", {
      method,
      params,
    });
  }

  // NOTE: new call `action`s must be specified also in the content script
  execute(
    action: string,
    args?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString().slice(4);
      window.webbtc._requests[id] = { resolve, reject };

      // post the request to the content script. from there it gets passed to the background script and back
      // in page script can not directly connect to the background script
      window.postMessage(
        {
          application: "LBE",
          prompt: true,
          action: `webln/${action}`,
          scope: "webln",
          args,
        },
        "*" // TODO use origin
      );

      function handleWindowMessage(messageEvent: MessageEvent) {
        // check if it is a relevant message
        // there are some other events happening
        if (
          !messageEvent.data ||
          !messageEvent.data.response ||
          messageEvent.data.application !== "LBE" ||
          !window.webbtc._requests[messageEvent.data.id]
        ) {
          return;
        }
        if (messageEvent.data.data.error) {
          window.webbtc._requests[messageEvent.data.id].reject(
            new Error(messageEvent.data.data.error)
          );
        } else {
          // 1. data: the message data
          // 2. data: the data passed as data to the message
          // 3. data: the actual response data
          window.webbtc._requests[messageEvent.data.id].resolve(
            messageEvent.data.data.data
          );
        }

        delete window.webbtc._requests[messageEvent.data.id];

        // For some reason must happen only at the end of this function
        window.removeEventListener("message", handleWindowMessage);
      }

      window.addEventListener("message", handleWindowMessage);
    });
  }
}
