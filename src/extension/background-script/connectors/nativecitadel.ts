import Native from "./Native";
import Citadel from "./citadel";

const NativeConnector = Native(Citadel);

type PostMessage = {
  id: string;
  method: string;
  url: string;
  body?: string;
  params?: Record<string, unknown>;
  headers: Record<string, string>;
};

export default class NativeCitadel extends NativeConnector {
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
    method: string,
    path: string,
    args?: Record<string, unknown>
  ): Promise<Type> {
    let body;
    let headers: Record<string, string> = {};
    path = this.config.url + (this.config.url.endsWith("/") ? "" : "/") + path;

    if (method !== "GET") {
      headers = {
        "Content-type": "application/json",
      };
    }
    if (this.jwt)
      headers = {
        ...headers,
        Authorization: `JWT ${this.jwt}`,
      };

    if (method === "POST") {
      body = JSON.stringify(args);
    }

    const response = await this._nativeRequest({
      headers,
      url: path,
      method: method || "GET",
      id: path + Math.floor(Math.random() * 1000 + 1).toString(),
      body,
    });

    if (response.status !== 200) {
      throw new Error(response.body);
    }

    const data = response.body;
    let parsed;
    try {
      parsed = JSON.parse(data);
    } catch {
      throw new Error(`Received invalid data: ${data}`);
    }

    if (typeof parsed === "string") {
      throw new Error(parsed);
    }

    return parsed;
  }
}
