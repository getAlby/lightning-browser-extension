import CommonProvider from "~/extension/providers/commonProvider";

declare global {
  interface Window {
    webbtc: WebBTCProvider;
  }
}

export default class WebBTCProvider extends CommonProvider {
  isEnabled: boolean;
  executing: boolean;

  constructor() {
    super(); // Call the constructor of the parent class

    this.isEnabled = false;
    this.executing = false;
  }

  enable() {
    if (this.enabled) {
      return Promise.resolve({ enabled: true });
    }
    return this.execute("webbtc", "enable").then((result) => {
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
    return this.execute("webbtc", "getInfo");
  }

  sendTransaction(address: string, amount: string) {
    if (!this.enabled) {
      throw new Error(
        "Provider must be enabled before calling sendTransaction"
      );
    }
    throw new Error("Alby does not support `sendTransaction`");
  }

  getAddress() {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling getAddress");
    }
    return this.execute("webbtc", "getAddressOrPrompt", {});
  }

  request(method: string, params: Record<string, unknown>) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling request");
    }

    throw new Error("Alby does not support `request`");
  }
}
