import { EventEmitter } from "events";

import { postMessage } from "../postMessage";

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

export default class WebLNProvider {
  enabled: boolean;
  isEnabled: boolean;
  executing: boolean;
  private _eventEmitter: EventEmitter;

  constructor() {
    this.enabled = false;
    this.isEnabled = false; // seems some webln implementations use webln.isEnabled and some use webln.enabled
    this.executing = false;
    this._eventEmitter = new EventEmitter();
  }

  async enable() {
    if (this.enabled) {
      return { enabled: true };
    }
    const result = await this.execute("enable");
    if (typeof result.enabled === "boolean") {
      this.enabled = result.enabled;
      this.isEnabled = result.enabled;
    }
    return result;
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

  getBalance() {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling getBalance");
    }
    return this.execute("getBalanceOrPrompt");
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

  on(...args: Parameters<EventEmitter["on"]>) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling on method");
    }

    this._eventEmitter.on(...args);
  }
  emit(...args: Parameters<EventEmitter["emit"]>) {
    this._eventEmitter.emit(...args);
  }

  off(...args: Parameters<EventEmitter["off"]>) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling off method");
    }
    this._eventEmitter.off(...args);
  }

  // NOTE: new call `action`s must be specified also in the content script
  execute(
    action: string,
    args?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return postMessage("webln", action, args);
  }
}
