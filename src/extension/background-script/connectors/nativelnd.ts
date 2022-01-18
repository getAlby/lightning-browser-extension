import Lnd from "./lnd";

import Native from "./Native";

const NativeConnector = Native(Lnd);

export default class NativeLnd extends NativeConnector {
  request<Type>(
    method: string,
    path: string,
    args?: Record<string, string>,
    defaultValues?: Record<string, unknown>
  ): Promise<Type> {
    const url = new URL(this.config.url);
    url.pathname = path;
    let body = "";
    const headers: Record<string, string> = {};
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
      const handler = (response: {
        id: string;
        status: number;
        body: string;
      }) => {
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
          resolve(data);
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
