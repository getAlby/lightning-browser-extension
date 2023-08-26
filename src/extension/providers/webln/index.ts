import CommonProvider from "~/extension/providers/commonProvider";

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

export default class WebLNProvider extends CommonProvider {
  async enable(): Promise<void> {
    if (this.enabled) {
      return;
    }
    const result = await this.execute("webln", "enable");
    if (typeof result.enabled === "boolean") {
      this.enabled = result.enabled;
    }
  }

  getInfo() {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling getInfo");
    }
    return this.execute("webln", "getInfo");
  }

  lnurl(lnurlEncoded: string) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling lnurl");
    }
    return this.execute("webln", "lnurl", { lnurlEncoded });
  }

  sendPayment(paymentRequest: string) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling sendPayment");
    }
    return this.execute("webln", "sendPaymentOrPrompt", { paymentRequest });
  }

  keysend(args: KeysendArgs) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling keysend");
    }
    return this.execute("webln", "keysendOrPrompt", args);
  }

  makeInvoice(args: string | number | RequestInvoiceArgs) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling makeInvoice");
    }
    if (typeof args !== "object") {
      args = { amount: args };
    }

    return this.execute("webln", "makeInvoice", args);
  }

  signMessage(message: string) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling signMessage");
    }

    return this.execute("webln", "signMessageOrPrompt", { message });
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
    return this.execute("webln", "getBalanceOrPrompt");
  }

  request(method: string, params: Record<string, unknown>) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling request");
    }

    return this.execute("webln", "request", {
      method,
      params,
    });
  }
}
