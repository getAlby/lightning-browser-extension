import EventEmitter from "events";
import { postMessage } from "../postMessage";
import { PromiseQueue } from "../promiseQueue";
import { Event } from "./types";

declare global {
  interface Window {
    nostr: NostrProvider;
  }
}

export default class NostrProvider {
  nip04 = new Nip04(this);
  enabled: boolean;
  private _eventEmitter: EventEmitter;
  private _queue: PromiseQueue;

  constructor() {
    this.enabled = false;
    this._eventEmitter = new EventEmitter();
    this._queue = new PromiseQueue();
  }

  async enable() {
    if (this.enabled) {
      return Promise.resolve({ enabled: true });
    }
    const result = await this.execute("enable");
    if (typeof result.enabled === "boolean") {
      this.enabled = result.enabled;
    }
    return result;
  }

  async getPublicKey() {
    await this.enable();
    return await this.execute("getPublicKeyOrPrompt");
  }

  async signEvent(event: Event) {
    await this.enable();
    return this.execute("signEventOrPrompt", { event });
  }

  async signSchnorr(sigHash: string) {
    await this.enable();
    return this.execute("signSchnorrOrPrompt", { sigHash });
  }

  async getRelays() {
    await this.enable();
    return this.execute("getRelays");
  }

  async on(...args: Parameters<EventEmitter["on"]>) {
    await this.enable();
    this._eventEmitter.on(...args);
  }

  async off(...args: Parameters<EventEmitter["off"]>) {
    await this.enable();
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
    return this._queue.add(() => postMessage("nostr", action, args));
  }
}

class Nip04 {
  provider: NostrProvider;

  constructor(provider: NostrProvider) {
    this.provider = provider;
  }

  async encrypt(peer: string, plaintext: string) {
    await this.provider.enable();
    return this.provider.execute("encryptOrPrompt", { peer, plaintext });
  }

  async decrypt(peer: string, ciphertext: string) {
    await this.provider.enable();
    return this.provider.execute("decryptOrPrompt", { peer, ciphertext });
  }
}
