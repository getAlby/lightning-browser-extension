import { PromiseQueue } from "~/extension/providers/promiseQueue";
import ProviderBase from "~/extension/providers/providerBase";

declare global {
  interface Window {
    liquid: LiquidProvider;
  }
}

export default class LiquidProvider extends ProviderBase {
  constructor(queue: PromiseQueue) {
    super("liquid", queue);
  }

  async getAddress() {
    this._checkEnabled("getAddress");
    return await this.execute("getAddressOrPrompt");
  }

  async signPset(pset: string) {
    this._checkEnabled("signPset");
    return this.execute("signPsetWithPrompt", { pset });
  }
}
