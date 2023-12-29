import ProviderBase from "~/extension/providers/providerBase";

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

export default class WebLNProvider extends ProviderBase {
  constructor() {
    super("webln");
  }

  getInfo() {
    this._checkEnabled("getInfo");
    return this.execute("getInfo");
  }

  lnurl(lnurlEncoded: string) {
    this._checkEnabled("lnurl");
    return this.execute("lnurl", { lnurlEncoded });
  }

  sendPayment(paymentRequest: string) {
    this._checkEnabled("sendPayment");
    return this.execute("sendPaymentOrPrompt", { paymentRequest });
  }
  sendPaymentAsync(paymentRequest: string) {
    this._checkEnabled("sendPaymentAsync");
    return this.execute("sendPaymentAsyncWithPrompt", { paymentRequest });
  }

  keysend(args: KeysendArgs) {
    this._checkEnabled("keysend");
    return this.execute("keysendOrPrompt", args);
  }

  makeInvoice(args: string | number | RequestInvoiceArgs) {
    this._checkEnabled("makeInvoice");
    if (typeof args !== "object") {
      args = { amount: args };
    }

    return this.execute("makeInvoice", args);
  }

  signMessage(message: string) {
    this._checkEnabled("signMessage");

    return this.execute("signMessageOrPrompt", { message });
  }

  verifyMessage(signature: string, message: string) {
    this._checkEnabled("verifyMessage");
    throw new Error("Alby does not support `verifyMessage`");
  }

  getBalance() {
    this._checkEnabled("getBalance");
    return this.execute("getBalanceOrPrompt");
  }

  request(method: string, params: Record<string, unknown>) {
    this._checkEnabled("request");

    return this.execute("request", {
      method,
      params,
    });
  }
}
