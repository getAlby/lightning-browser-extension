import CommonProvider from "~/extension/providers/commonProvider";

declare global {
  interface Window {
    liquid: LiquidProvider;
  }
}

export default class LiquidProvider extends CommonProvider {
  async enable(): Promise<void> {
    if (this.enabled) {
      return;
    }
    const result = await this.execute("liquid", "enable");
    if (typeof result.enabled === "boolean") {
      this.enabled = result.enabled;
    }
  }

  async getAddress() {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling getAddress");
    }
    return await this.execute("liquid", "getAddressOrPrompt");
  }

  async signPset(pset: string) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling signPset");
    }
    return this.execute("liquid", "signPsetWithPrompt", { pset });
  }
}
