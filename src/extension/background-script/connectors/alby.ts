import fetchAdapter from "@vespaiach/axios-fetch-adapter";
import type { AxiosResponse, Method } from "axios";
import axios, { AxiosRequestConfig } from "axios";
import lightningPayReq from "bolt11";
import Base64 from "crypto-js/enc-base64";
import Hex from "crypto-js/enc-hex";
import hmacSHA256 from "crypto-js/hmac-sha256";
import sha256 from "crypto-js/sha256";
import browser from "webextension-polyfill";
import utils from "~/common/lib/utils";
import HashKeySigner from "~/common/utils/signer";
import { edit, get } from "~/extension/background-script/actions/accounts";
import { Account } from "~/types";

import state from "../state";
import { auth } from "./alby-js-sdk/src";
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
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: number;
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
    const outgoingData = await this.request<
      {
        r_hash: {
          type: "Buffer";
          data: number[];
        };
        amount: number;
        custom_records: ConnectorInvoice["custom_records"];
        memo: string;
        expire_time: number;
        ispaid: boolean;
        keysend: boolean;
        pay_req: string;
        payment_hash: string;
        payment_request: string;
        r_hash_str: string;
        settled: boolean;
        settled_at: number;
        state: string;
        type: string;
        value: number;
        metadata: string;
      }[]
    >("GET", "/invoices/outgoing", undefined);

    const incomingData = await this.request<
      {
        r_hash: {
          type: "Buffer";
          data: number[];
        };
        amount: number;
        custom_records: ConnectorInvoice["custom_records"];
        memo: string;
        expire_time: number;
        ispaid: boolean;
        keysend: boolean;
        pay_req: string;
        payment_hash: string;
        payment_request: string;
        r_hash_str: string;
        settled: boolean;
        settled_at: number;
        state: string;
        type: string;
        value: number;
        metadata: string;
      }[]
    >("GET", "/invoices/incoming", undefined);

    const invoices: ConnectorInvoice[] = incomingData
      .map(
        (invoice, index): ConnectorInvoice => ({
          custom_records: invoice.custom_records,
          id: `${invoice.payment_request}-${index}`,
          memo: invoice.memo,
          preimage: "", // lndhub doesn't support preimage (yet)
          settled: invoice.settled,
          settleDate: invoice.settled_at,
          totalAmount: `${invoice.amount}`,
          type: "incoming",
        })
      )
      .concat(
        outgoingData.map(
          (invoice, index): ConnectorInvoice => ({
            custom_records: invoice.custom_records,
            id: `${invoice.payment_request}-${index}`,
            memo: invoice.memo,
            preimage: "", // lndhub doesn't support preimage (yet)
            settled: invoice.ispaid,
            settleDate: invoice.settled_at,
            totalAmount: `${invoice.amount}`,
            type: "outgoing",
          })
        )
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
    const alias = "🐝 getalby.com";
    return {
      data: {
        alias,
      },
    };
  }

  async getBalance(): Promise<GetBalanceResponse> {
    const { balance } = await this.request<{ balance: number }>(
      "GET",
      "/balance",
      undefined
    );
    return {
      data: {
        balance: balance,
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
    }>("POST", "/payments/bolt11", {
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
    }>("POST", "/payments/keysend", {
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
    let paid: boolean = false;

    try {
      const response = await this.request<{
        r_hash: {
          type: "Buffer";
          data: number[];
        };
        amount: number;
        custom_records: ConnectorInvoice["custom_records"];
        memo: string;
        expire_time: number;
        ispaid: boolean;
        keysend: boolean;
        pay_req: string;
        payment_hash: string;
        payment_request: string;
        r_hash_str: string;
        settled: boolean;
        settled_at: number;
        state: string;
        type: string;
        value: number;
        metadata: string;
      }>("GET", `/invoices/${args.paymentHash}`, undefined);

      const settled = response.settled === true;
      if (settled) paid = true;
      return {
        data: {
          paid,
        },
      };
    } catch (error) {
      return {
        data: {
          paid,
        },
      };
    }
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
      payment_hash: { type: string; data: ArrayBuffer } | string;
    }>("POST", "/invoices", {
      amount: args.amount,
      memo: args.memo,
    });
    if (
      typeof data.payment_hash === "object" &&
      data.payment_hash.type === "Buffer"
    ) {
      data.payment_hash = Buffer.from(data.payment_hash.data).toString("hex");
    }

    return {
      data: {
        paymentRequest: data.payment_request,
        rHash: data.payment_hash as string,
      },
    };
  }

  async authorize() {
    const redirectURL = browser.identity.getRedirectURL();
    const authClient = new auth.OAuth2User({
      client_id:
        process.env.NODE_ENV === "development" ? "pjUO3A9Sha" : "LlHAh0TRmg",
      client_secret:
        process.env.NODE_ENV === "development"
          ? "ECGEPB4E0g95WscEdG8M"
          : "SUlqS1DEvXTw2tFQS7vQ",
      callback: redirectURL,
      scopes: [
        "invoices:read",
        "account:read",
        "balance:read",
        "invoices:create",
        "invoices:read",
        "payments:send",
        "transactions:read", // for outgoing invoice
      ],
      token: {
        access_token: this.config.accessToken,
        refresh_token: this.config.refreshToken,
        expires_at: this.config.tokenExpiresAt,
      }, // initialize with existing token
    });
    let lnurlAuthUrl = authClient.generateAuthURL({
      code_challenge_method: "S256",
    });

    if (process.env.NODE_ENV === "development")
      lnurlAuthUrl = lnurlAuthUrl.replace(
        "getalby.com",
        "app.regtest.getalby.com"
      );

    try {
      let authToken;

      if (
        this.config.accessToken != undefined &&
        this.config.refreshToken != undefined
      ) {
        if (authClient.isAccessTokenExpired()) {
          // launching webauth flow again when accesstoken is expired - now refreshing access token
          // case1: after regenerating ore back in the config - storing back after regeneration
          // case2: how to detect expiry of refresh token and update config

          const token = await authClient.refreshAccessToken();

          if (authClient.token) {
            authClient.token.access_token = token.token.access_token;
            authClient.token.refresh_token = token.token.refresh_token;
          }

          const account = await get({
            action: "getAccount",
            origin: { internal: true },
          });

          if (account) {
            edit({
              action: "editAccount",
              args: {
                name: account.data?.name,
                id: account.data?.id,
                accessToken: authClient.token?.access_token,
                refreshToken: authClient.token?.refresh_token,
                tokenExpiresAt: authClient.token?.expires_at,
              },
              origin: {
                internal: true,
              },
            });
          }
        }
      } else {
        const authResult = await this.launchWebAuthFlow(lnurlAuthUrl);

        if (authResult) {
          authToken = new URL(authResult).searchParams.get("code");
        } else {
          throw new Error("Authentication failed: missing authResult");
        }

        if (!authToken) {
          throw new Error("Authentication failed: missing token");
        }

        await authClient.requestAccessToken(authToken);
      }

      this.access_token = authClient.token?.access_token;
      const expires_at = authClient.token?.expires_at;

      this.access_token_created = +new Date();
      this.refresh_token = authClient.token?.refresh_token;

      this.refresh_token_created = +new Date();

      const authData: {
        access_token?: string;
        refresh_token?: string;
        expires_at?: number;
      } = {};

      authData.access_token = this.access_token;

      authData.refresh_token = this.refresh_token;
      authData.expires_at = expires_at;

      return authData;
    } catch (e) {
      throw new Error(
        `API error (${this.config.url})${
          e instanceof Error ? `: ${e.message}` : ""
        }`
      );
    }
  }

  async launchWebAuthFlow(lnurlAuthUrl: string) {
    const authResult = await browser.identity.launchWebAuthFlow({
      interactive: true,
      url: lnurlAuthUrl,
    });

    return authResult;
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
    const url =
      process.env.NODE_ENV === "development"
        ? `https://api.regtest.getalby.com${path}`
        : `https://api.getalby.com${path}`;

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
