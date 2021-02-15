import memoizee from "memoizee";
import Base from "./base";

class LnBits extends Base {
  constructor(connectorConfig, globalSettings) {
    super(connectorConfig, globalSettings);
    this.getInfo = memoizee(
      (args) =>
        this.request(
          "GET",
          "/api/v1/wallet",
          this.config.readkey,
          undefined,
          {}
        ),
      {
        promise: true,
        maxAge: 20000,
        preFetch: true,
        normalizer: () => "getinfo",
      }
    );
    this.getBalance = memoizee(
      (args) =>
        this.request(
          "GET",
          "/api/v1/wallet",
          this.config.readkey,
          undefined,
          {}
        ),
      {
        promise: true,
        maxAge: 20000,
        preFetch: true,
        normalizer: () => "balance",
      }
    );
  }

  sendPayment(message) {
    return super.sendPayment(message, () => {
      this.request("POST", "/api/v1/payments", {
        bolt11: message.args.paymentRequest,
        out: true,
      });
    });
  }

  async request(method, path, apiKey, args, defaultValues) {
    let body = null;
    let query = "";
    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/json");
    headers.append("X-Api-Key", apiKey);

    if (method === "POST") {
      body = JSON.stringify(args);
    } else if (args !== undefined) {
      query = `?`; //`?${stringify(args)}`;
    }
    const res = await fetch(this.config.url + path + query, {
      method,
      headers,
      body,
    });
    if (!res.ok) {
      const errBody = await res.json();
      console.log("errBody", errBody);
      throw new Error(errBody);
    }
    let data = await res.json();
    if (defaultValues) {
      data = Object.assign(Object.assign({}, defaultValues), data);
    }
    // TODO: specify and follow API
    data.alias = data.name;
    return { data };
  }
}

export default LnBits;
