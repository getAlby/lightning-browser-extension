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

  async enable() {
    if (this.enabled) {
      return { enabled: true };
    }
    const result = await this.execute("enable");
    if (typeof result.enabled === "boolean") {
      this.enabled = result.enabled;
    }
    return result;
  }

  async getAddress() {
    await this.enable();
    return await this.execute("getAddressOrPrompt");
  }

  async signPset(pset: string) {
    await this.enable();
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
