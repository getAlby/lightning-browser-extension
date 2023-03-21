import { Event } from "./types";

export default class NostrProvider {
  nip04 = new Nip04(this);
  enabled: boolean;

  constructor() {
    this.enabled = false;
  }

  async enable() {
    if (this.enabled) {
      return { enabled: true };
    }
    return await this.execute<{
      enabled: boolean;
      remember: boolean;
    }>("enable");
  }

  async getPublicKey(): Promise<string> {
    await this.enable();
    return await this.execute("getPublicKeyOrPrompt");
  }

  async signEvent(event: Event): Promise<Event> {
    await this.enable();
    return this.execute("signEventOrPrompt", { event });
  }

  async signSchnorr(sigHash: string): Promise<Buffer> {
    await this.enable();
    return this.execute("signSchnorrOrPrompt", { sigHash });
  }

  async getRelays(): Promise<string[]> {
    await this.enable();
    return this.execute<string[]>("getRelays");
  }

  // NOTE: new call `action`s must be specified also in the content script
  execute<T>(action: string, args?: Record<string, unknown>): Promise<T> {
    return new Promise((resolve, reject) => {
      // post the request to the content script. from there it gets passed to the background script and back
      // in page script can not directly connect to the background script
      window.postMessage(
        {
          application: "LBE",
          prompt: true,
          action: `nostr/${action}`,
          scope: "nostr",
          args,
        },
        "*" // TODO use origin
      );

      function handleWindowMessage(messageEvent: MessageEvent) {
        // check if it is a relevant message
        // there are some other events happening
        if (
          !messageEvent.data ||
          !messageEvent.data.response ||
          messageEvent.data.application !== "LBE" ||
          messageEvent.data.scope !== "nostr"
        ) {
          return;
        }

        if (messageEvent.data.data.error) {
          reject(new Error(messageEvent.data.data.error));
        } else {
          // 1. data: the message data
          // 2. data: the data passed as data to the message
          // 3. data: the actual response data
          resolve(messageEvent.data.data.data);
        }
        // For some reason must happen only at the end of this function
        window.removeEventListener("message", handleWindowMessage);
      }

      window.addEventListener("message", handleWindowMessage);
    });
  }
}

class Nip04 {
  provider: NostrProvider;

  constructor(provider: NostrProvider) {
    this.provider = provider;
  }

  async encrypt(peer: string, plaintext: string): Promise<string> {
    await this.provider.enable();
    return this.provider.execute("encryptOrPrompt", { peer, plaintext });
  }

  async decrypt(peer: string, ciphertext: string): Promise<string> {
    await this.provider.enable();
    return this.provider.execute("decryptOrPrompt", { peer, ciphertext });
  }
}
