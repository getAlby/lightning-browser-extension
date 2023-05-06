import fetchAdapter from "@vespaiach/axios-fetch-adapter";
import { auth } from "alby-js-sdk";
import type { AxiosResponse } from "axios";
import axios, { AxiosRequestConfig, Method } from "axios";
import lightningPayReq from "bolt11";
import Base64 from "crypto-js/enc-base64";
import Hex from "crypto-js/enc-hex";
import hmacSHA256 from "crypto-js/hmac-sha256";
import sha256 from "crypto-js/sha256";
import utils from "~/common/lib/utils";
import HashKeySigner from "~/common/utils/signer";
import { Account } from "~/types";

import state from "../state";
import Connector, {
  CheckPaymentArgs,
  CheckPaymentResponse,
  ConnectorInvoice,
  ConnectPeerResponse,
  GetBalanceResponse,
  GetInfoResponse,
  GetInvoicesResponse,
  KeysendArgs,
  MakeInvoiceArgs,
  MakeInvoiceResponse,
  SendPaymentArgs,
  SendPaymentResponse,
  SignMessageArgs,
  SignMessageResponse,
} from "./connector.interface";

interface Config {
  login: string;
  password: string;
  url: string;
}

const HMAC_VERIFY_HEADER_KEY =
  process.env.HMAC_VERIFY_HEADER_KEY || "alby-extension"; // default is mainly that TS is happy

const defaultHeaders = {
  Accept: "application/json",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
  "X-User-Agent": "alby-extension",
};

export default class Alby implements Connector {
  account: Account;
  config: Config;
  access_token?: string;
  access_token_created?: number;
  refresh_token?: string;
  refresh_token_created?: number;
  noRetry?: boolean;

  constructor(account: Account, config: Config) {
    this.account = account;
    this.config = config;
  }

  async init() {
    return this.authorize();
  }

  unload() {
    return Promise.resolve();
  }

  get supportedMethods() {
    return ["getInfo", "keysend", "makeInvoice", "sendPayment", "signMessage"];
  }

  // not yet implemented
  async connectPeer(): Promise<ConnectPeerResponse> {
    console.error(
      `${this.constructor.name} does not implement the getInvoices call`
    );
    throw new Error("Not yet supported with the currently used account.");
  }

  async getInvoices(): Promise<GetInvoicesResponse> {
    const data = await this.request<
      {
        r_hash: {
          type: "Buffer";
          data: number[];
        };
        amt: number;
        custom_records: ConnectorInvoice["custom_records"];
        description: string;
        expire_time: number;
        ispaid: boolean;
        keysend: boolean;
        pay_req: string;
        payment_hash: string;
        payment_request: string;
        timestamp: number;
        type: "user_invoice";
      }[]
    >("GET", "/getuserinvoices", undefined);

    const invoices: ConnectorInvoice[] = data
      .map(
        (invoice, index): ConnectorInvoice => ({
          custom_records: invoice.custom_records,
          id: `${invoice.payment_request}-${index}`,
          memo: invoice.description,
          preimage: "", // lndhub doesn't support preimage (yet)
          settled: invoice.ispaid,
          settleDate: invoice.timestamp * 1000,
          totalAmount: `${invoice.amt}`,
          type: "received",
        })
      )
      .sort((a, b) => {
        return b.settleDate - a.settleDate;
      });

    return {
      data: {
        invoices,
      },
    };
  }

  async getInfo(): Promise<GetInfoResponse> {
    const { alias } = await this.request<{ alias: string }>(
      "GET",
      "/getinfo",
      undefined
    );
    return {
      data: {
        alias,
      },
    };
  }

  async getBalance(): Promise<GetBalanceResponse> {
    const { BTC } = await this.request<{ BTC: { AvailableBalance: number } }>(
      "GET",
      "/balance",
      undefined
    );

    return {
      data: {
        balance: BTC.AvailableBalance,
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
      throw new Error(data.message);
    }
    if (data.payment_error) {
      throw new Error(data.payment_error);
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
      const paymentRequestDetails = lightningPayReq.decode(args.paymentRequest);
      const amountInSats = paymentRequestDetails.satoshis || 0;
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

  async keysend(args: KeysendArgs): Promise<SendPaymentResponse> {
    const data = await this.request<{
      error: string;
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
      payment_route: { total_amt: number; total_fees: number };
    }>("POST", "/keysend", {
      destination: args.pubkey,
      amount: args.amount,
      customRecords: args.customRecords,
    });
    if (data.error) {
      throw new Error(data.message);
    }
    if (data.payment_error) {
      throw new Error(data.payment_error);
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

    return {
      data: {
        preimage: data.payment_preimage as string,
        paymentHash: data.payment_hash as string,
        route: data.payment_route,
      },
    };
  }

  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    const { paid } = await this.request<{ paid: boolean }>(
      "GET",
      `/checkpayment/${args.paymentHash}`,
      undefined
    );
    return {
      data: {
        paid,
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
    let message: string | Uint8Array;
    message = sha256(args.message).toString(Hex);
    let keyHex = sha256(
      `lndhub://${this.config.login}:${this.config.password}`
    ).toString(Hex);
    const { settings } = state.getState();
    if (settings.legacyLnurlAuth) {
      message = utils.stringToUint8Array(args.message);
      keyHex = sha256(
        `LBE-LNDHUB-${this.config.url}-${this.config.login}-${this.config.password}`
      ).toString(Hex);
    }
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
        message: args.message,
        signature: signedMessageDERHex,
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
    const lnurlAuthUrl = await this.getLnurlAuthUrl();
    try {
      const authResult = await chrome.identity.launchWebAuthFlow({
        interactive: true,
        url: lnurlAuthUrl,
      });

      let authToken;
      if (authResult) {
        authToken = new URL(authResult).searchParams.get("token");
      } else {
        throw new Error("Authentication failed: missing authResult");
      }

      if (!authToken) {
        throw new Error("Authentication failed: missing token");
      }

      const { data: authData } = await axios.post(
        lnurlAuthUrl,
        { auth_token: authToken },
        {
          headers: {
            ...defaultHeaders,
            "X-TS": Math.floor(Date.now() / 1000),
            "X-VERIFY": this.generateHmacVerification(lnurlAuthUrl),
          },
          adapter: fetchAdapter,
        }
      );

      if (authData.error || authData.errors) {
        const error = authData.error || authData.errors;
        const errMessage = error?.errors?.[0]?.message || error?.[0]?.message;

        throw new Error(errMessage);
      }

      this.refresh_token = authData.refresh_token;
      this.access_token = authData.access_token;
      this.refresh_token_created = +new Date();
      this.access_token_created = +new Date();

      return authData;
    } catch (e) {
      throw new Error(
        `API error (${this.config.url})${
          e instanceof Error ? `: ${e.message}` : ""
        }`
      );
    }
  }

  // Helper function to generate the lnurl authentication URL
  async getLnurlAuthUrl() {
    const redirectURL = chrome.identity.getRedirectURL();
    const authClient = new auth.OAuth2User({
      client_id: "test_client",
      client_secret: "test_secret",
      callback: redirectURL,
      scopes: [
        "invoices:read",
        "account:read",
        "balance:read",
        "invoices:create",
        "invoices:read",
        "payments:send",
      ],
      token: {
        access_token: undefined,
        refresh_token: undefined,
        expires_at: undefined,
      }, // initialize with existing token
    });
    const authUrl = authClient.generateAuthURL({
      code_challenge_method: "S256",
    });

    let newAuthUrl = authUrl;
    if (process.env.NODE_ENV === "development") {
      newAuthUrl = authUrl.replace("getalby.com", "app.regtest.getalby.com");
    }

    return newAuthUrl;
  }

  generateHmacVerification(uri: string) {
    const mac = hmacSHA256(uri, HMAC_VERIFY_HEADER_KEY).toString(Base64);
    return encodeURIComponent(mac);
  }

  async request<Type>(
    method: Method,
    path: string,
    args?: Record<string, unknown>
  ): Promise<Type> {
    if (!this.access_token) {
      await this.authorize();
    }

    const url = `${this.config.url}${path}`;
    const reqConfig: AxiosRequestConfig = {
      method,
      url: url,
      responseType: "json",
      headers: {
        ...defaultHeaders,
        Authorization: `Bearer ${this.access_token}`,
        "X-TS": Math.floor(Date.now() / 1000),
        "X-VERIFY": this.generateHmacVerification(url),
      },
      adapter: fetchAdapter,
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
      console.error(e);

      if (axios.isAxiosError(e)) {
        const errResponse = e.response as AxiosResponse;

        if (errResponse?.status === 404) {
          const method = path.replace("/", "");
          throw new Error(`${method} not supported by the connected account.`);
        }

        if (errResponse?.status === 401) {
          try {
            await this.authorize();
          } catch (e) {
            console.error(e);
            if (e instanceof Error) throw new Error(e.message);
          }
          return this.request(method, path, args);
        }

        const errorMessage = `${errResponse?.data.message}\n(${e.message})`;
        throw new Error(errorMessage);
      }
    }

    if (data?.error) {
      if (data.code * 1 === 1 && !this.noRetry) {
        try {
          await this.authorize();
        } catch (e) {
          console.error(e);
          if (e instanceof Error) throw new Error(e.message);
        }
        this.noRetry = true;
        return this.request(method, path, args);
      } else {
        throw new Error(data.message);
      }
    }

    return data;
  }
}
