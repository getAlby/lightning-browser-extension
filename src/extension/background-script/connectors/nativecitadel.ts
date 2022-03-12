import Citadel from "./citadel";

import Native from "./Native";

const NativeConnector = Native(Citadel);

interface Config {
  url: string;
  password: string;
}

type PostMessage = {
  id: string;
  method: string;
  url: string;
  body?: string;
  params?: Record<string, unknown>;
  headers: Record<string, string>;
};

export default class NativeCitadel extends NativeConnector {
  constructor(config: Config) {
    super(config);
    this.citadel.requestFunc = (
      jwt: string,
      url: string,
      method?: "GET" | "POST" | "PUT" | "DELETE",
      body?: unknown,
      auth?: boolean
    ) => {
      return this.request(jwt, url, method, body, auth);
    };
  }

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

  async request<ResponseType = unknown>(
    jwt: string,
    url: string,
    method?: "GET" | "POST" | "PUT" | "DELETE",
    body?: unknown,
    auth?: boolean
  ): Promise<ResponseType> {
    let authHeader = "";
    if (jwt) authHeader = `JWT ${jwt}`;
    let headers: Record<string, string> = {};
    if (method !== "GET") {
      headers = {
        "Content-type": "application/json",
      };
    }
    if (authHeader && auth)
      headers = {
        ...headers,
        Authorization: authHeader,
      };

    const response = await this._nativeRequest({
      headers,
      url: url,
      method: method || "GET",
      id: url + Math.floor(Math.random() * 1000 + 1).toString(),
    });

    if (response.status !== 200) {
      throw new Error(response.body);
    }

    const data = response.body;
    let parsed: unknown;
    try {
      parsed = JSON.parse(data);
    } catch {
      throw new Error(`Received invalid data: ${data}`);
    }

    if (typeof parsed === "string") {
      throw new Error(parsed);
    }

    return parsed as ResponseType;
  }
}
