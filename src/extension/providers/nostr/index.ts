import EventEmitter from "events";
import { postMessage } from "../postMessage";
import { Event } from "./types";

declare global {
  interface Window {
    nostr: NostrProvider;
  }
}

class PromiseQueue {
  private queue: Promise<unknown> = Promise.resolve(true);

  add<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue = this.queue.then(operation).then(resolve).catch(reject);
    });
  }
}

export default class NostrProvider {
  nip04 = new Nip04(this);
  enabled: boolean;
  private _eventEmitter: EventEmitter;
  queue: PromiseQueue;

  constructor() {
    this.enabled = false;
    this._eventEmitter = new EventEmitter();
    this.queue = new PromiseQueue();
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
    return this.queue.add(async () => {
      await this.enable();
      return await this.execute("getPublicKeyOrPrompt");
    });
  }

  async signEvent(event: Event) {
    return this.queue.add(async () => {
      await this.enable();
      return this.execute("signEventOrPrompt", { event });
    });
  }

  async signSchnorr(sigHash: string) {
    return this.queue.add(async () => {
      await this.enable();
      return this.execute("signSchnorrOrPrompt", { sigHash });
    });
  }

  async getRelays() {
    return this.queue.add(async () => {
      await this.enable();
      return this.execute("getRelays");
    });
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
    return postMessage("nostr", action, args);
  }
}

class Nip04 {
  provider: NostrProvider;

  constructor(provider: NostrProvider) {
    this.provider = provider;
  }

  async encrypt(peer: string, plaintext: string) {
    return this.provider.queue.add(async () => {
      await this.provider.enable();
      return this.provider.execute("encryptOrPrompt", { peer, plaintext });
    });
  }

  async decrypt(peer: string, ciphertext: string) {
    return this.provider.queue.add(async () => {
      await this.provider.enable();
      return this.provider.execute("decryptOrPrompt", { peer, ciphertext });
    });
  }
}
