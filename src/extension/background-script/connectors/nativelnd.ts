import browser from "webextension-polyfill";

import Lnd from "./lnd";

const nativeApplication = "alby";

export default class NativeLnd extends Lnd {
  running: boolean | null;
  port: any

  init() {
    return new Promise((resolve, reject) => {
      if (!this.port) {
        this.port = browser.runtime.connectNative(nativeApplication);
        this.port.onDisconnect.addListener((p) => {
          if (p.error) {
            console.log(`Disconnected due to an error: ${p.error.message}`);
          }
          console.log("native app disconnected");
          this.port = null;
        });
      }
      setTimeout(() => {
        console.log("init done");
        resolve();
      }, 7000);
    });
  }

  request(method: string, path: string, args?: any, defaultValues?: any) {
    //if (this.running) {
    //  throw new Error("request already running");
    //}
    this.running = true;
    const url = new URL(this.config.url);
    url.pathname = path;
    let body = null;
    const query = "";
    const headers = {};
    headers["Accept"] = "application/json";
    if (method === "POST") {
      body = JSON.stringify(args);
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
        this.running = false;
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
