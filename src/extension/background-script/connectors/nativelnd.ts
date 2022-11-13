import Native from "./Native";
import Lnd from "./lnd";

const NativeConnector = Native(Lnd);

export default class NativeLnd extends NativeConnector {
  protected request<Type>(
    method: string,
    path: string,
    args?: Record<string, unknown>
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
      url.search = new URLSearchParams(
        args as Record<string, string>
      ).toString();
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
          const data = JSON.parse(response.body);
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
