import EventEmitter from "events";
import ProviderBase from "~/extension/providers/providerBase";
import { Event } from "./types";

declare global {
  interface Window {
    nostr: NostrProvider;
  }
}

export default class NostrProvider extends ProviderBase {
  nip04 = new Nip04(this);
  nip44 = new Nip44(this);

  constructor() {
    super("nostr");
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

  //override method from base class, we don't want to throw error if not enabled
  async on(...args: Parameters<EventEmitter["on"]>) {
    await this.enable();
    super.on(...args);
  }

  async off(...args: Parameters<EventEmitter["off"]>) {
    await this.enable();
    super.off(...args);
  }
}

class Nip04 {
  provider: NostrProvider;

  constructor(provider: NostrProvider) {
    this.provider = provider;
  }

  async encrypt(peer: string, plaintext: string) {
    await this.provider.enable();
    return this.provider.execute("encryptOrPrompt", {
      peer,
      plaintext,
    });
  }

  async decrypt(peer: string, ciphertext: string) {
    await this.provider.enable();
    return this.provider.execute("decryptOrPrompt", {
      peer,
      ciphertext,
    });
  }
}

class Nip44 {
  provider: NostrProvider;

  constructor(provider: NostrProvider) {
    this.provider = provider;
  }

  async encrypt(peer: string, plaintext: string) {
    await this.provider.enable();
    return this.provider.execute("nip44EncryptOrPrompt", {
      peer,
      plaintext,
    });
  }

  async decrypt(peer: string, ciphertext: string) {
    await this.provider.enable();
    return this.provider.execute("nip44DecryptOrPrompt", {
      peer,
      ciphertext,
    });
  }
}
