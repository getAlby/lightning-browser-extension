import { postMessage } from "../postMessage";

declare global {
  interface Window {
    webbtc: WebBTCProvider;
  }
}

export default class WebBTCProvider {
  enabled: boolean;
  isEnabled: boolean;
  executing: boolean;

  constructor() {
    this.enabled = false;
    this.isEnabled = false;
    this.executing = false;
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

  signPsbt(psbt: string, derivationPath?: string) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling signPsbt");
    }

    return this.execute("signPsbtWithPrompt", { psbt, derivationPath });
  }

  sendTransaction(address: string, amount: string) {
    if (!this.enabled) {
      throw new Error(
        "Provider must be enabled before calling sendTransaction"
      );
    }
    throw new Error("Alby does not support `sendTransaction`");
  }

  async getAddress(index?: number, change?: boolean, derivationPath?: string) {
    const addresses = await this.getAddresses(index, 1, change, derivationPath);
    return addresses[0];
  }

  getAddresses(
    index?: number,
    num?: number,
    change?: boolean,
    derivationPath?: string
  ) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling getAddress");
    }
    return this.execute("getAddressesWithPrompt", {
      index,
      num,
      change,
      derivationPath,
    });
  }

  request(method: string, params: Record<string, unknown>) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling request");
    }

    throw new Error("Alby does not support `request`");
  }

  // NOTE: new call `action`s must be specified also in the content script
  execute(
    action: string,
    args?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return postMessage("webbtc", action, args);
  }
}
