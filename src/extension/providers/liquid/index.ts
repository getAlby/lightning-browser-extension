import { PromiseQueue } from "~/extension/providers/promiseQueue";
import { postMessage } from "../postMessage";

declare global {
  interface Window {
    liquid: LiquidProvider;
  }
}

export default class LiquidProvider {
  enabled: boolean;
  private _queue: PromiseQueue;

  constructor() {
    this.enabled = false;
    this._queue = new PromiseQueue();
  }

  async enable(): Promise<void> {
    if (this.enabled) {
      return;
    }
    const result = await this.execute("enable");
    if (typeof result.enabled === "boolean") {
      this.enabled = result.enabled;
    }
  }

  async getAddress() {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling getAddress");
    }
    return await this.execute("getAddressOrPrompt");
  }

  async signPset(pset: string) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling signPset");
    }
    return this.execute("signPsetWithPrompt", { pset });
  }

  // NOTE: new call `action`s must be specified also in the content script
  execute(
    action: string,
    args?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return this._queue.add(() => postMessage("liquid", action, args));
  }
}
