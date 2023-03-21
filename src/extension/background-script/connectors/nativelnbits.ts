import { Method } from "axios";

import Native from "./Native";
import LnBits from "./lnbits";

const NativeConnector = Native(LnBits);

type PostMessage = {
  id: string;
  method: string;
  url: string;
  body?: string;
  params?: Record<string, unknown>;
  headers: Record<string, string>;
};

export default class NativeLnBits extends NativeConnector {
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
  async request<Type>(
    method: Method,
    path: string,
    apiKey: string,
    args?: Record<string, unknown>
  ): Promise<Type> {
    let body;
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
    };

    if (method === "POST") {
      body = JSON.stringify(args);
    }

    const url = new URL(this.config.url);
    url.pathname = path;

    const reqConfig = {
      id: path,
      method,
      url: url.toString(),
      headers,
      body,
    };
    let data;
    try {
      const res = await this._nativeRequest(reqConfig);
      data = JSON.parse(res.body);
    } catch (e) {
      console.error(e);
      if (e instanceof Error) throw new Error(e.message);
    }

    return data;
  }
}
