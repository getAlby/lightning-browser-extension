import CommonProvider from "~/extension/providers/commonProvider";
import { Event } from "./types";

declare global {
  interface Window {
    nostr: NostrProvider;
  }
}

export default class NostrProvider extends CommonProvider {
  nip04 = new Nip04(this);

  async enable() {
    if (this.enabled) {
      return Promise.resolve({ enabled: true });
    }
    const result = await this.execute("nostr", "enable");
    if (typeof result.enabled === "boolean") {
      this.enabled = result.enabled;
    }
    return result;
  }

  async getPublicKey() {
    await this.enable();
    return await this.execute("nostr", "getPublicKeyOrPrompt");
  }

  async signEvent(event: Event) {
    await this.enable();
    return this.execute("nostr", "signEventOrPrompt", { event });
  }

  async signSchnorr(sigHash: string) {
    await this.enable();
    return this.execute("nostr", "signSchnorrOrPrompt", { sigHash });
  }

  async getRelays() {
    await this.enable();
    return this.execute("nostr", "getRelays");
  }
}

class Nip04 {
  provider: NostrProvider;

  constructor(provider: NostrProvider) {
    this.provider = provider;
  }

  async encrypt(peer: string, plaintext: string) {
    await this.provider.enable();
    return this.provider.execute("nostr", "encryptOrPrompt", {
      peer,
      plaintext,
    });
  }

  async decrypt(peer: string, ciphertext: string) {
    await this.provider.enable();
    return this.provider.execute("nostr", "decryptOrPrompt", {
      peer,
      ciphertext,
    });
  }
}
