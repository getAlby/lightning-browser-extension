import browser from "webextension-polyfill";

import LndHub from "./lndhub";

const nativeApplication = "alby";

export default class NativeLndHub extends LndHub {
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

  async unload() {
    if (this._port) {
      this._port.disconnect(); // stop the native companion app
    }
  }

  _nativeRequest(postMessage) {
    return new Promise((resolve, reject) => {
      const handler = (response) => {
        console.log(response);
        if (response.id !== postMessage.id) {
          return;
        }
        this.port.onMessage.removeListener(handler);
        // TODO: think how to handle errors
        if (response.status > 299) {
          reject(new Error(response.body));
        } else {
          resolve(response);
        }
      };
      this.port.onMessage.addListener(handler);
      this.port.postMessage(postMessage);
    });
  }

  async authorize() {
    const headers = {
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    };
    const url = new URL(this.config.url);
    url.pathname = "/auth";
    const params = { type: "auth" };

    const body = JSON.stringify({
      login: this.config.login,
      password: this.config.password,
    });

    return this._nativeRequest({
      id: "auth",
      method: "POST",
      url: url.toString(),
      body,
      params,
      headers,
    }).then((response) => {
      console.log(response.body);
      const json = JSON.parse(response.body);
      if (json && json.error) {
        throw new Error(
          "API error: " + json.message + " (code " + json.code + ")"
        );
      }
      if (!json.access_token || !json.refresh_token) {
        throw new Error("API unexpected response: " + JSON.stringify(json));
      }

      this.refresh_token = json.refresh_token;
      this.access_token = json.access_token;
      this.refresh_token_created = +new Date();
      this.access_token_created = +new Date();
      return json;
    });
  }

  async request<Type>(
    method: Method,
    path: string,
    args?: Record<string, unknown>,
    defaultValues?: Record<string, unknown>
  ): Promise<Type> {
    if (!this.access_token) {
      await this.authorize();
    }

    const headers = {
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.access_token}`,
    };

    const url = new URL(this.config.url);
    url.pathname = path;
    let body = null;
    let params = null;
    if (method === "POST") {
      body = JSON.stringify(args);
    } else {
      params = args;
    }
    const reqConfig = {
      id: path,
      method,
      url: url.toString(),
      headers,
      body,
      params,
    };
    let data;
    try {
      const res = await this._nativeRequest(reqConfig);
      console.log({res});
      data = JSON.parse(res.body);
    } catch (e) {
      console.log(e);
      if (e instanceof Error) throw new Error(e.message);
    }
    if (data && data.error) {
      if (data.code * 1 === 1 && !this.noRetry) {
        try {
          await this.authorize();
        } catch (e) {
          console.log(e);
          if (e instanceof Error) throw new Error(e.message);
        }
        this.noRetry = true;
        return this.request(method, path, args, defaultValues);
      } else {
        throw new Error(data.message);
      }
    }
    if (defaultValues) {
      data = Object.assign(Object.assign({}, defaultValues), data);
    }
    return data;
  }
}
