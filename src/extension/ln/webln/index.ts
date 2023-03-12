declare global {
  interface Window {
    webln: WebLNProvider;
  }
}

type RequestInvoiceArgs = {
  amount?: string | number;
  defaultAmount?: string | number;
  minimumAmount?: string | number;
  maximumAmount?: string | number;
  defaultMemo?: string;
};

type KeysendArgs = {
  destination: string;
  customRecords?: Record<string, string>;
  amount: string | number;
};

interface Requests {
  [key: string]: {
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  };
}

export default class WebLNProvider {
  enabled: boolean;
  isEnabled: boolean;
  executing: boolean;
  _requests: Requests;

  constructor() {
    this.enabled = false;
    this.isEnabled = false; // seems some webln implementations use webln.isEnabled and some use webln.enabled
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

  lnurl(lnurlEncoded: string) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling lnurl");
    }
    return this.execute("lnurl", { lnurlEncoded });
  }

  sendPayment(paymentRequest: string) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling sendPayment");
    }
    return this.execute("sendPaymentOrPrompt", { paymentRequest });
  }

  keysend(args: KeysendArgs) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling keysend");
    }
    return this.execute("keysendOrPrompt", args);
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
      this._requests[id] = { resolve, reject };
      console.log("🟢 added " + id + " to _requests", action);

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
          messageEvent.data.scope !== "webln" ||
          !window.nostr._requests[messageEvent.data.id]
        ) {
          return;
        }
        if (messageEvent.data.data.error) {
          window.webln._requests.reject(
            new Error(messageEvent.data.data.error)
          );
        } else {
          // 1. data: the message data
          // 2. data: the data passed as data to the message
          // 3. data: the actual response data
          window.webln._requests.resolve(messageEvent.data.data.data);
        }
        // For some reason must happen only at the end of this function
        window.removeEventListener("message", handleWindowMessage);
      }

      window.addEventListener("message", handleWindowMessage);
    });
  }
}
