import axios from "axios";
import Base from "./base";

export default class LndHub extends Base {
  async init() {
    return this.authorize();
  }

  getInfo() {
    return this.request("GET", "/getinfo", undefined, {}).then((data) => {
      return {
        data: {
          alias: data.alias,
        },
      };
    });
  }

  getBalance() {
    return this.request("GET", "/balance", undefined, {}).then((data) => {
      return {
        data: {
          balance: data.BTC.AvailableBalance,
        },
      };
    });
  }

  sendPayment(args) {
    return this.request("POST", "/payinvoice", {
      invoice: args.paymentRequest,
    }).then((data) => {
      if (data.error) {
        return { error: data.message };
      }
      if (data.payment_error) {
        return { error: data.payment_error };
      }
      if (
        typeof data.payment_hash === "object" &&
        data.payment_hash.type === "Buffer"
      ) {
        data.payment_hash = Buffer.from(data.payment_hash.data).toString("hex");
      }
      if (
        typeof data.payment_preimage === "object" &&
        data.payment_preimage.type === "Buffer"
      ) {
        data.payment_preimage = Buffer.from(
          data.payment_preimage.data
        ).toString("hex");
      }
      return {
        data: {
          preimage: data.payment_preimage,
          paymentHash: data.payment_hash,
          route: data.payment_route,
        },
      };
    });
  }

  signMessage(args) {
    return Promise.reject(new Error("Not supported with Lndhub"));
  }

  makeInvoice(args) {
    return this.request("POST", "/addinvoice", {
      amt: args.amount,
      memo: args.memo,
    }).then((data) => {
      if (typeof data.r_hash === "object" && data.r_hash.type === "Buffer") {
        data.r_hash = Buffer.from(data.r_hash.data).toString("hex");
      }
      return {
        data: {
          paymentRequest: data.payment_request,
          rHash: data.r_hash,
        },
      };
    });
  }

  async authorize() {
    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Access-Control-Allow-Origin", "*");
    headers.append("Content-Type", "application/json");
    return fetch(this.config.url + "/auth?type=auth", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        login: this.config.login,
        password: this.config.password,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("API error: " + response.status);
        }
      })
      .then((json) => {
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

  async request(method, path, args, defaultValues) {
    if (!this.access_token) {
      await this.authorize();
    }

    const reqConfig = {
      method: method,
      url: this.config.url + path,
      responseType: "json",
      headers: {
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.access_token}`,
      },
    };
    if (method === "POST") {
      reqConfig.data = args;
    } else if (args !== undefined) {
      reqConfig.params = args;
    }
    try {
      const res = await axios(reqConfig);
      let data = res.data;
      if (data && data.error) {
        if (data.code * 1 === 1 && !this.noRetry) {
          await this.authorize();
          this.noRetry = true;
          return this.request(method, path, args, defaultValues);
        }
      }
      if (defaultValues) {
        data = Object.assign(Object.assign({}, defaultValues), data);
      }
      return data;
    } catch (e) {
      console.log(e);
      throw new Error(e.response.data);
    }
  }
}
