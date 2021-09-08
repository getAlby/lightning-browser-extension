import Base from "./base";

class Lnd extends Base {
  getInfo() {
    return this.request("GET", "/v1/getinfo", undefined, {}).then((res) => {
      return {
        data: {
          alias: res.data.alias,
          pubkey: res.data.identity_pubkey,
          color: res.data.color,
        },
      };
    });
  }

  getBalance() {
    return this.getChannelsBalance();
  }

  sendPayment(args) {
    return this.request(
      "POST",
      "/v1/channels/transactions",
      {
        payment_request: args.paymentRequest,
      },
      {}
    ).then((res) => {
      if (res.data.payment_error) {
        return { error: res.data.payment_error };
      }
      return {
        data: {
          preimage: res.data.payment_preimage,
          paymentHash: res.data.payment_hash,
          route: res.data.payment_route,
        },
      };
    });
  }

  signMessage(args) {
    return this.request("POST", "/v2/signer/signmessage", args);
  }

  makeInvoice(args) {
    return this.request("POST", "/v1/invoices", {
      memo: args.memo,
      value: args.amount,
    }).then((res) => {
      return {
        data: {
          paymentRequest: res.data.payment_request,
          rHash: res.data.r_hash,
        },
      };
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
    }).then((res) => {
      return {
        data: {
          balance: res.data.balance,
          pending_open_balance: res.data.pending_open_balance,
        },
      };
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
