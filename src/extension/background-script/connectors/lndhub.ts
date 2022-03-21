import axios, { AxiosRequestConfig, Method } from "axios";
import sha256 from "crypto-js/sha256";
import Hex from "crypto-js/enc-hex";
import { parsePaymentRequest } from "invoices";
import utils from "../../../common/lib/utils";
import HashKeySigner from "../../../common/utils/signer";
import Connector, {
  SendPaymentArgs,
  SendPaymentResponse,
  CheckPaymentArgs,
  CheckPaymentResponse,
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
  login: string;
  password: string;
  url: string;
}

export default class LndHub implements Connector {
  config: Config;
  access_token?: string;
  access_token_created?: number;
  refresh_token?: string;
  refresh_token_created?: number;
  noRetry?: boolean;

  constructor(config: Config) {
    this.config = config;
  }

  async init() {
    return this.authorize();
  }

  unload() {
    return Promise.resolve();
  }

  async getInfo(): Promise<GetInfoResponse> {
    const data = await this.request<{ alias: string }>(
      "GET",
      "/getinfo",
      undefined,
      {}
    );
    return {
      data: {
        alias: data.alias,
      },
    };
  }

  async getBalance(): Promise<GetBalanceResponse> {
    const data = await this.request<{ BTC: { AvailableBalance: number } }>(
      "GET",
      "/balance",
      undefined,
      {}
    );
    return {
      data: {
        balance: data.BTC.AvailableBalance,
      },
    };
  }

  async sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse> {
    const data = await this.request<{
      error?: string;
      message: string;
      payment_error?: string;
      payment_hash:
        | {
            type: string;
            data: ArrayBuffer;
          }
        | string;
      payment_preimage:
        | {
            type: string;
            data: ArrayBuffer;
          }
        | string;
      payment_route?: { total_amt: number; total_fees: number };
    }>("POST", "/payinvoice", {
      invoice: args.paymentRequest,
    });
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
      data.payment_preimage = Buffer.from(data.payment_preimage.data).toString(
        "hex"
      );
    }

    // HACK!
    // some Lnbits extension that implement the LNDHub API do not return the route information.
    // to somewhat work around this we set a payment route and use the amount from the payment request.
    // lnbits needs to fix this and return proper route information with a total amount and fees
    if (!data.payment_route) {
      const paymentRequestDetails = parsePaymentRequest({
        request: args.paymentRequest,
      });
      const amountInSats = paymentRequestDetails.tokens;
      data.payment_route = { total_amt: amountInSats, total_fees: 0 };
    }
    return {
      data: {
        preimage: data.payment_preimage as string,
        paymentHash: data.payment_hash as string,
        route: data.payment_route,
      },
    };
  }

  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    const data = await this.request<{ paid: boolean }>(
      "GET",
      `/checkpayment/${args.paymentHash}`,
      undefined,
      {}
    );
    return {
      data: {
        paid: data.paid,
      },
    };
  }

  signMessage(args: SignMessageArgs): Promise<SignMessageResponse> {
    // make sure we got the config to create a new key
    if (!this.config.url || !this.config.login || !this.config.password) {
      return Promise.reject(new Error("Missing config"));
    }
    if (!args.message) {
      return Promise.reject(new Error("Invalid message"));
    }
    const message = utils.stringToUint8Array(args.message);
    // create a signing key from the lndhub URL and the login/password combination
    const keyHex = sha256(
      `LBE-LNDHUB-${this.config.url}-${this.config.login}-${this.config.password}`
    ).toString(Hex);
    if (!keyHex) {
      return Promise.reject(new Error("Could not create key"));
    }
    const signer = new HashKeySigner(keyHex);
    const signedMessageDERHex = signer.sign(message).toDER("hex");
    // make sure we got some signed message
    if (!signedMessageDERHex) {
      return Promise.reject(new Error("Signing failed"));
    }
    return Promise.resolve({
      data: {
        signature: signedMessageDERHex,
      },
    });
  }

  verifyMessage(args: VerifyMessageArgs): Promise<VerifyMessageResponse> {
    // create a signing key from the lndhub URL and the login/password combination
    const keyHex = sha256(
      `LBE-LNDHUB-${this.config.url}-${this.config.login}-${this.config.password}`
    ).toString(Hex);
    if (!keyHex) {
      return Promise.reject(new Error("Could not create key"));
    }
    const signer = new HashKeySigner(keyHex);
    return Promise.resolve({
      data: {
        valid: signer.verify(args.message, args.signature),
      },
    });
  }

  async makeInvoice(args: MakeInvoiceArgs): Promise<MakeInvoiceResponse> {
    const data = await this.request<{
      payment_request: string;
      r_hash: { type: string; data: ArrayBuffer } | string;
    }>("POST", "/addinvoice", {
      amt: args.amount,
      memo: args.memo,
    });
    if (typeof data.r_hash === "object" && data.r_hash.type === "Buffer") {
      data.r_hash = Buffer.from(data.r_hash.data).toString("hex");
    }
    return {
      data: {
        paymentRequest: data.payment_request,
        rHash: data.r_hash as string,
      },
    };
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

  async request<Type>(
    method: Method,
    path: string,
    args?: Record<string, unknown>,
    defaultValues?: Record<string, unknown>
  ): Promise<Type> {
    if (!this.access_token) {
      await this.authorize();
    }

    const reqConfig: AxiosRequestConfig = {
      method,
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
    let data;
    try {
      const res = await axios(reqConfig);
      data = res.data;
    } catch (e) {
      console.log(e);
      if (e instanceof Error) throw new Error(e.message);
    }
    if (data && data.error) {
      if (data.code * 1 === 1 && !this.noRetry) {
        try {
          await this.authorize();
        } catch (e) {
          console.log(e);
          if (e instanceof Error) throw new Error(e.message);
        }
        this.noRetry = true;
        return this.request(method, path, args, defaultValues);
      } else {
        throw new Error(data.message);
      }
    }
    if (defaultValues) {
      data = Object.assign(Object.assign({}, defaultValues), data);
    }
    return data;
  }
}
