import { Event } from "./types";

export default class NostrProvider {
  nip04 = new Nip04(this);
  enabled: boolean;

  constructor() {
    this.enabled = false;
  }

  private enable() {
    // if (this.enabled) {
    //   return Promise.resolve({ enabled: true });
    // }
    return this.execute<{
      enabled: boolean;
      remember: boolean;
    }>("enable").then((result) => {
      if (typeof result.enabled === "boolean") {
        this.enabled = result.enabled;
      }
      return result;
    });
  }

  async getPublicKey(): Promise<string> {
    return await this.execute("getPublicKeyOrPrompt");
  }

  async signEvent(event: Event): Promise<Event | boolean> {
    // if (!this.enabled) {
    //   throw new Error("Provider must be enabled before calling signEvent");
    // }
    console.log("signEvent 1");

    // this.enable();
    console.log("signEvent 2");

    return this.execute<{
      enabled: boolean;
      remember: boolean;
    }>("enable").then((result) => {
      if (result.enabled) {
        return this.execute("signEventOrPrompt", { event });
      } else {
        return false;
      }
    });
  }

  async getRelays(): Promise<string[]> {
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
    throw new Error("Nip04 is not yet implemented.");
  }

  async decrypt(peer: string, ciphertext: string): Promise<string> {
    throw new Error("Nip04 is not yet implemented.");
  }
}
