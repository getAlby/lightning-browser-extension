import { Method } from "axios";

import Native from "./Native";
import LndHub from "./lndhub";

const NativeConnector = Native(LndHub);

type PostMessage = {
  id: string;
  method: string;
  url: string;
  body?: string;
  params?: Record<string, unknown>;
  headers: Record<string, string>;
};

export default class NativeLndHub extends NativeConnector {
  _nativeRequest(postMessage: PostMessage) {
    return new Promise<{
      id: string;
      status: number;
      body: string;
    }>((resolve, reject) => {
      const handler = (response: {
        id: string;
        status: number;
        body: string;
      }) => {
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
    args?: Record<string, unknown>
  ): Promise<Type> {
    if (!this.access_token) {
      await this.authorize();
    }

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.access_token}`,
    };

    const url = new URL(this.config.url);
    url.pathname = path;
    let body;
    let params;
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
      data = JSON.parse(res.body);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) throw new Error(e.message);
    }
    if (data && data.error) {
      if (data.code * 1 === 1 && !this.noRetry) {
        try {
          await this.authorize();
        } catch (e) {
          console.error(e);
          if (e instanceof Error) throw new Error(e.message);
        }
        this.noRetry = true;
        return this.request(method, path, args);
      } else {
        throw new Error(data.message);
      }
    }
    return data;
  }
}
