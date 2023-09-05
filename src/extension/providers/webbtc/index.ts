import ProviderBase from "~/extension/providers/providerBase";

declare global {
  interface Window {
    webbtc: WebBTCProvider;
  }
}

export default class WebBTCProvider extends ProviderBase {
  isEnabled: boolean;
  executing: boolean;

  constructor() {
    super("webbtc");
    this.isEnabled = false;
    this.executing = false;
  }

  getInfo() {
    this._checkEnabled("getInfo");
    return this.execute("getInfo");
  }

  signPsbt(psbt: string) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling signPsbt");
    }

    return this.execute("signPsbtWithPrompt", { psbt });
  }

  sendTransaction(address: string, amount: string) {
    this._checkEnabled("sendTransaction");
    throw new Error("Alby does not support `sendTransaction`");
  }

  getAddress() {
    this._checkEnabled("getAddress");
    return this.execute("getAddressOrPrompt", {});
  }

  request(method: string, params: Record<string, unknown>) {
    this._checkEnabled("request");

    throw new Error("Alby does not support `request`");
  }
}
