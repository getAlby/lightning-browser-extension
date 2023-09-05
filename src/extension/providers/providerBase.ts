import { EventEmitter } from "events";
import { postMessage } from "~/extension/providers/postMessage";
import { PromiseQueue } from "~/extension/providers/promiseQueue";

export default class ProviderBase {
  enabled: boolean;
  private _eventEmitter: EventEmitter;
  private _queue: PromiseQueue;
  private _scope: string;

  constructor(scope: string) {
    this.enabled = false;
    this._eventEmitter = new EventEmitter();
    this._queue = new PromiseQueue();
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

  // NOTE: new call `action`s must be specified also in the content script
  execute(
    action: string,
    args?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return this._queue.add(() => postMessage(this._scope, action, args));
  }
}
