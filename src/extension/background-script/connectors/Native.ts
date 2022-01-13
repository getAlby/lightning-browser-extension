import browser from "webextension-polyfill";

const nativeApplication = "alby";

// https://www.typescriptlang.org/docs/handbook/mixins.html
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
type Constructor = new (...args: any[]) => {};

export default function Native<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    _port: browser.Runtime.Port | undefined | null;

    get port() {
      if (this._port) {
        return this._port;
      } else {
        this.connectNativeCompanion();
        return this._port as unknown as browser.Runtime.Port;
      }
    }

    connectNativeCompanion() {
      this._port = browser.runtime.connectNative(nativeApplication);
      // Add status listener
      // If the native app sends an error (e.g. Tor failed) we simply try to restart for now.
      // Sadly we do not have any way to notify the user from here
      this._port.onMessage.addListener((response) => {
        if (response.id !== "status") {
          return;
        }
        // TODO: test this
        if (response.status === 502 && response.header["X-Alby-Internal"]) {
          console.error("Error in the native companion. Shutting it down");
          console.error(response);
          this.unload();
        }
      });
      this._port.onDisconnect.addListener((p) => {
        console.error("Native companion disconnected");
        if (p.error) {
          console.error(`Native companion error: ${p.error.message}`);
        }
        this._port = null;
      });
    }

    async init() {
      if (!this._port) {
        this.connectNativeCompanion();
      }
    }

    unload(): Promise<void> {
      return new Promise((resolve, reject) => {
        if (this._port) {
          this._port.disconnect(); // stop the native companion app
          this._port = null;
          setTimeout(resolve, 5000); // we wait for 2 seconds for the native app to shut down. Sadly we do not know when exactly it exited
        } else {
          resolve();
        }
      });
    }
  };
}
