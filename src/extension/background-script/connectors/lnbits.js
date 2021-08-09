import Base from "./base";
import { parsePaymentRequest } from "invoices";

class LnBits extends Base {
  getInfo() {
    return this.request(
      "GET",
      "/api/v1/wallet",
      this.config.readkey,
      undefined,
      {}
    ).then((data) => {
      return {
        data: {
          alias: data.name,
        },
      };
    });
  }

  getBalance() {
    return this.request(
      "GET",
      "/api/v1/wallet",
      this.config.readkey,
      undefined,
      {}
    ).then((data) => {
      return {
        data: {
          balance: data.balance,
        },
      };
    });
  }

  sendPayment(args) {
    const paymentRequestDetails = parsePaymentRequest({
      request: args.paymentRequest,
    });
    const amountInSats = parseInt(paymentRequestDetails.tokens);
    return this.request("POST", "/api/v1/payments", this.config.adminkey, {
      bolt11: args.paymentRequest,
      out: true,
    })
      .then((data) => {
        // TODO: how do we get the total amount here??
        return this.checkPayment(data.checking_id).then((checkData) => {
          return {
            data: {
              payment_preimage: checkData.preimage,
              payment_hash: data.payment_hash,
              payment_route: { total_amt: amountInSats, total_fees: 0 },
            },
          };
        });
      })
      .catch((e) => {
        return { error: e.message };
      });
  }

  checkPayment(checkingId) {
    return this.request(
      "GET",
      `/api/v1/payments/${checkingId}`,
      this.config.readkey
    );
  }
    
  signMessage(args) {
    return Promise.reject(new Error("Not supported with Lnbits"));
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
      throw new Error(errBody.message);
    }
    let data = await res.json();
    if (defaultValues) {
      data = Object.assign(Object.assign({}, defaultValues), data);
    }
    return data;
  }
}

export default LnBits;
