import { EventEmitter } from "events";
import { postMessage } from "~/extension/providers/postMessage";
import { PromiseQueue } from "~/extension/providers/promiseQueue";

export default class CommonProvider {
  enabled: boolean;
  private _eventEmitter: EventEmitter;
  private _queue: PromiseQueue;

  constructor() {
    this.enabled = false;
    this._eventEmitter = new EventEmitter();
    this._queue = new PromiseQueue();
  }

  on(...args: Parameters<EventEmitter["on"]>) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling on method");
    }

    this._eventEmitter.on(...args);
  }

  off(...args: Parameters<EventEmitter["off"]>) {
    if (!this.enabled) {
      throw new Error("Provider must be enabled before calling off method");
    }
    this._eventEmitter.off(...args);
  }

  emit(...args: Parameters<EventEmitter["emit"]>) {
    this._eventEmitter.emit(...args);
  }

  // NOTE: new call `action`s must be specified also in the content script
  execute(
    scope: string,
    action: string,
    args?: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return this._queue.add(() => postMessage(scope, action, args));
  }
}
