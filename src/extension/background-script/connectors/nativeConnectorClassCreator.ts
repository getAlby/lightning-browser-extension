import browser from "webextension-polyfill";

import Lnd from "./lnd";
import LndHub from "./lndhub";

const nativeApplication = "alby";

const parentClasses = {
  lnd: Lnd,
  lndhub: LndHub,
};

export default function nativeConnectorClassCreator(
  connectorType: "lnd" | "lndhub"
) {
  const parentClass = parentClasses[connectorType];

  return class extends parentClass {
    _port: unknown;

    get port() {
      if (this._port) {
        return this._port;
      } else {
        this.connectNativeCompanion();
        return this._port;
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
