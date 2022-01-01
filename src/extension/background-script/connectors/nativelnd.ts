import browser from "webextension-polyfill";

import Lnd from "./lnd";

const nativeApplication = "alby";

export default class NativeLnd extends Lnd {
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
      if (response.id !== 'status') {
        return;
      }
      // TODO: test this
      if (response.status === 502 && response.header['X-Alby-Internal']) {
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

  request(
    method: string,
    path: string,
    args?: Record<string, unknown>,
    defaultValues?: Record<string, unknown>
  ): Promise<unknown> {
    const url = new URL(this.config.url);
    url.pathname = path;
    let body = null;
    const headers = {};
    headers["Accept"] = "application/json";
    if (method === "POST") {
      body = JSON.stringify(args) as string;
      headers["Content-Type"] = "application/json";
    } else if (args !== undefined) {
      url.search = new URLSearchParams(args).toString();
    }
    if (this.config.macaroon) {
      headers["Grpc-Metadata-macaroon"] = this.config.macaroon;
    }

    return new Promise((resolve, reject) => {
      const handler = (response) => {
        if (response.id !== path) {
          return;
        }
        this.port.onMessage.removeListener(handler);
        // TODO: think how to handle errors
        if (response.status > 299) {
          reject(new Error(response.body));
        } else {
          let data = JSON.parse(response.body);
          if (defaultValues) {
            data = Object.assign(Object.assign({}, defaultValues), data);
          }
          resolve({ data });
        }
      };
      this.port.onMessage.addListener(handler);
      this.port.postMessage({
        id: path,
        method,
        url: url.toString(),
        body,
        headers,
      });
    });
  }
}
