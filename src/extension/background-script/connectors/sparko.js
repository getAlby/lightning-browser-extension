import axios from "axios";
import Base from "./base";

class Sparko extends Base {
  getInfo() {}

  getBalance() {}

  sendPayment(args) {
    return this.request("pay", {
      bolt11: args.paymentRequest,
      maxfeepercent: 0.3,
      exemptfee: 1,
    });
  }

  signMessage(args) {}

  makeInvoice(args) {
    const label = Date.now(); // TODO: use better/proper label
    return this.request("invoice", [
      `${args.amount}sat`,
      label,
      args.memo,
    ]).then((response) => {
      return {
        data: {
          paymentRequest: res.bolt11,
          rHash: res.payment_hash,
        },
      };
    });
  }

  getChannelsBalance() {
    return this.request("listfunds").then((response) => {
      const balance = response.channels
        .filter((c) => c.state === "CHANNELD_NORMAL")
        .reduce((amount, c) => {
          return amount + parseInt(c.channel_sat);
        }, 0);
      return {
        data: { balance },
      };
    });
  }

  getBlockchainBalance() {
    return this.request("listfunds").then((response) => {
      const balance = response.outputs
        .filter((o) => o.status === "confirmed" || o.status === "pending")
        .reduce((amount, o) => {
          return amount + parseInt(o.value);
        }, 0);
      return {
        data: { balance },
      };
    });
  }

  getTransactions() {}

  async request(method, params = {}, range) {
    const reqConfig = {
      method: "POST",
      url: `${this.config.url}/rpc`,
      responseType: "json",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Access": this.config.accessKey,
        Range: range,
      },
      data: { method, params },
    };
    try {
      const response = await axios(reqConfig);
      return response.data;
    } catch (e) {
      console.log("Sparko Request failed: ", e);
      const err = new Error(e.response.data);
      throw err;
    }
  }
}

export default Sparko;
