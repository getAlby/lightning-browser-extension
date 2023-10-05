import { EventEmitter } from "events";
import { postMessage } from "~/extension/providers/postMessage";

export default class ProviderBase {
  enabled: boolean;
  private _eventEmitter: EventEmitter;

  private _scope: string;

  constructor(scope: string) {
    this._scope = scope;
    this.enabled = false;
    this._eventEmitter = new EventEmitter();
    this._scope = scope;
  }

  protected _checkEnabled(methodName: string): void {
    if (!this.enabled) {
      throw new Error(`Provider must be enabled before calling ${methodName}`);
    }
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

  on(...args: Parameters<EventEmitter["on"]>) {
    this._checkEnabled("on");
    this._eventEmitter.on(...args);
  }

  off(...args: Parameters<EventEmitter["off"]>) {
    this._checkEnabled("off");
    this._eventEmitter.off(...args);
  }

  emit(...args: Parameters<EventEmitter["emit"]>) {
    this._eventEmitter.emit(...args);
  }

  async isProviderEnabled(): Promise<boolean> {
    if (this.enabled) {
      return true;
    }
    const result = await this.execute("isEnabled");
    if (typeof result.isEnabled === "boolean") {
      this.enabled = result.isEnabled;
    }
    return this.enabled;
  }

  // NOTE: new call `action`s must be specified also in the content script
  execute(
    action: string,
    args?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return postMessage(this._scope, action, args);
  }
}
