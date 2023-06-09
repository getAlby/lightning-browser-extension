import { postMessage } from "../postMessage";

declare global {
  interface Window {
    liquid: LiquidProvider;
  }
}

export default class LiquidProvider {
  enabled: boolean;

  constructor() {
    this.enabled = false;
  }

  async enable() {
    if (this.enabled) {
      return { enabled: true };
    }
    return await this.execute("enable");
  }

  async getPublicKey() {
    await this.enable();
    return await this.execute("getPublicKeyOrPrompt");
  }

  async signSchnorr(sigHash: Buffer) {
    await this.enable();
    return this.execute("signSchnorrOrPrompt", { sigHash });
  }

  // NOTE: new call `action`s must be specified also in the content script
  execute(
    action: string,
    args?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return postMessage("liquid", action, args);
  }
}
