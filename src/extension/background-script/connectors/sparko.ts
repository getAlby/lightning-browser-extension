import axios, { AxiosRequestConfig, AxiosError} from "axios";

import Connector, {
  SendPaymentArgs,
  SendPaymentResponse,
  GetInfoResponse,
  GetBalanceResponse,
  MakeInvoiceArgs,
  MakeInvoiceResponse,
  SignMessageArgs,
  SignMessageResponse,
  VerifyMessageArgs,
  VerifyMessageResponse,
} from "./connector.interface";

interface Config {
  accessKey: string;
  url: string;
}

class Sparko implements Connector {
  config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  getInfo(): Promise<GetInfoResponse> {
    return this.request("getinfo").then((response) => {
      return {
        data: {
          alias: response.alias,
          pubkey: response.id,
          color: response.color,
        },
      };
    });
  }

  getBalance(): Promise<GetBalanceResponse> {
    return this.getChannelsBalance();
  }

  sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse> {
    return this.request("pay", {
      bolt11: args.paymentRequest,
      maxfeepercent: 0.3,
      exemptfee: 1,
    }).then((response) => {
      const satSent = response.amount_sent_msat / 1000;
      const totalFees = (response.amount_sent_msat - response.amount_msat) / 1000;
      return {
        data: {
          preimage: response.payment_preimage,
          paymentHash: response.payment_hash,
          route: { total_amt: satSent, total_fees: totalFees },
        },
      };
    });
  }

  signMessage(args: SignMessageArgs): Promise<SignMessageResponse> {
    return this.request("signmessage", { message: args.message }).then((response) => {
      return {
        data: {
          message: args.message,
          signature: response.zbase,
        },
      };
    });
  }

  verifyMessage(args: VerifyMessageArgs): Promise<VerifyMessageResponse> {
    return Promise.reject("TODO");
  }

  makeInvoice(args: MakeInvoiceArgs): Promise<MakeInvoiceResponse> {
    const label = Date.now(); // TODO: use better/proper label
    return this.request("invoice", [
      `${args.amount}sat`,
      label,
      args.memo,
    ]).then((response) => {
      return {
        data: {
          paymentRequest: response.bolt11,
          rHash: response.payment_hash,
        },
      };
    });
  }

  getChannelsBalance() {
    return this.request("listfunds").then((response) => {
      const balance = response.channels
        .filter((c:any) => c.state === "CHANNELD_NORMAL")
        .reduce((amount:number, c:any) => {
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
        .filter((o:any) => o.status === "confirmed" || o.status === "pending")
        .reduce((amount:number, o:any) => {
          return amount + parseInt(o.value);
        }, 0);
      return {
        data: { balance },
      };
    });
  }

  async request(method: string, params: any = {}, range: string = "") {
    const reqConfig: AxiosRequestConfig = {
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
      // how do I do this correct in typescript?
      //if (e instanceof Error && e.response) {
      //  const err = new Error(e.response.data);
      //  throw err;
      //}
    }
  }
}

export default Sparko;
