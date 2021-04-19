import memoizee from "memoizee";
import Base from "./base";

class Lnd extends Base {
  constructor(connectorConfig, globalSettings) {
    super(connectorConfig, globalSettings);
    this.config = connectorConfig;
    this.getInfo = memoizee(
      (args) => this.request("GET", "/v1/getinfo", undefined, {}),
      {
        promise: true,
        maxAge: 20000,
        preFetch: true,
        normalizer: () => "getinfo",
      }
    );
    this.getBalance = memoizee(() => this.getChannelsBalance(), {
      promise: true,
      maxAge: 20000,
      preFetch: true,
      normalizer: () => "getinfo",
    });
  }

  sendPayment(message) {
    return super.sendPayment(message, () => {
      // TODO: should we use /v2/router/send ?
      return this.request(
        "POST",
        "/v1/channels/transactions",
        {
          payment_request: message.args.paymentRequest,
        },
        {}
      );
    });
  }

  makeInvoice(message) {
    return this.request("POST", "/v1/invoices", {
      memo: message.args.memo,
      value: message.args.amount,
    });
  }

  getAddress() {
    return this.request("POST", "/v2/wallet/address/next", undefined, {});
  }

  getBlockchainBalance = () => {
    return this.request("GET", "/v1/balance/blockchain", undefined, {
      unconfirmed_balance: "0",
      confirmed_balance: "0",
      total_balance: "0",
    });
  };

  getChannelsBalance = () => {
    return this.request("GET", "/v1/balance/channels", undefined, {
      pending_open_balance: "0",
      balance: "0",
    });
  };

  getTransactions = () => {
    return this.request("GET", "/v1/payments", undefined, {
      transactions: [],
    });
  };

  async request(method, path, args, defaultValues) {
    let body = null;
    let query = "";
    const headers = new Headers();
    headers.append("Accept", "application/json");
    if (method === "POST") {
      body = JSON.stringify(args);
      headers.append("Content-Type", "application/json");
    } else if (args !== undefined) {
      query = `?`; //`?${stringify(args)}`;
    }
    if (this.config.macaroon) {
      headers.append("Grpc-Metadata-macaroon", this.config.macaroon);
    }
    try {
      const res = await fetch(this.config.url + path + query, {
        method,
        headers,
        body,
      });
      if (!res.ok) {
        let errBody;
        try {
          errBody = await res.json();
          if (!errBody.error) {
            throw new Error();
          }
        } catch (err) {
          throw new Error({
            statusText: res.statusText,
            status: res.status,
          });
        }
        console.log("errBody", errBody);
        throw errBody;
      }
      let data = await res.json();
      if (defaultValues) {
        data = Object.assign(Object.assign({}, defaultValues), data);
      }
      return { data };
    } catch (err) {
      console.error(`API error calling ${method} ${path}`, err);
      // Thrown errors must be JSON serializable, so include metadata if possible
      if (err.code || err.status || !err.message) {
        throw err;
      }
      throw err.message;
    }
  }
}

export default Lnd;
