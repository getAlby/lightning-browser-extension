import fetchAdapter from "@vespaiach/axios-fetch-adapter";
import type { AxiosResponse } from "axios";
import axios, { AxiosRequestConfig, Method } from "axios";
import Hex from "crypto-js/enc-hex";
import sha256 from "crypto-js/sha256";
import { ACCOUNT_CURRENCIES } from "~/common/constants";
import { getBTCToSats, getSatsToBTC } from "~/common/utils/currencyConvert";
import HashKeySigner from "~/common/utils/signer";
import { Account } from "~/types";

import Connector, {
  CheckPaymentArgs,
  CheckPaymentResponse,
  ConnectPeerResponse,
  GetBalanceResponse,
  GetInfoResponse,
  GetTransactionsResponse,
  KeysendArgs,
  MakeInvoiceArgs,
  MakeInvoiceResponse,
  SendPaymentArgs,
  SendPaymentResponse,
  SignMessageArgs,
  SignMessageResponse,
} from "./connector.interface";

const API_URL = "https://kollider.me/api";

// Currently the same as ACCOUNT_CURRENCIES, this is for the future when more connectors support Fiat Accounts
type KolliderCurrencies = Extract<ACCOUNT_CURRENCIES, "BTC" | "EUR" | "USD">;

interface Config {
  username: string;
  password: string;
  currency: KolliderCurrencies;
}

interface KolliderAccount {
  account_id: string;
  balance: string;
  currency: KolliderCurrencies;
  account_type: string;
}

const defaultHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export default class Kollider implements Connector {
  account: Account;
  config: Config;
  access_token?: string;
  access_token_created?: number;
  refresh_token?: string;
  refresh_token_created?: number;
  noRetry?: boolean;
  accounts: Record<KolliderAccount["account_id"], KolliderAccount> | undefined;
  currency: KolliderCurrencies;
  currentAccountId: string | null;

  constructor(account: Account, config: Config) {
    this.account = account;
    this.config = config;
    this.currency = config.currency;
    this.currentAccountId = null;
  }

  async init() {
    await this.authorize();
    await this.loadAccounts();
    this.currentAccountId = await this.findAccountId(this.config.currency);
  }

  unload() {
    return Promise.resolve();
  }

  // not yet implemented
  async connectPeer(): Promise<ConnectPeerResponse> {
    console.error(
      `${this.constructor.name} does not implement the connectPeer call`
    );
    throw new Error("Not yet supported with the currently used account.");
  }

  async getTransactions(): Promise<GetTransactionsResponse> {
    console.error(
      `getTransactions() is not yet supported with the currently used account: ${this.constructor.name}`
    );
    return { data: { transactions: [] } };
  }

  async getInfo(): Promise<GetInfoResponse> {
    return { data: { alias: `Kollider (${this.currency})` } };
  }

  async getBalance(): Promise<GetBalanceResponse> {
    await this.loadAccounts();
    const account = await this.findAccount(this.currency);

    if (!account) {
      throw new Error("Account not found");
    }

    let balance = account.balance;

    if (account.currency === "BTC") {
      balance = Math.round(getBTCToSats(account.balance)).toString();
    }

    return {
      data: {
        balance: parseFloat(balance),
        currency: account.currency,
      },
    };
  }

  async sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse> {
    const data = await this.request<{
      req_id: string;
      payment_hash: string;
      uid: number;
      success: boolean;
      currency: KolliderCurrencies; // => current account's currency
      payment_request: string;
      amount: null | {
        value: string;
        currency: KolliderCurrencies; // => Should be BTC, cause Alby sends only sats
      };
      fees: null | {
        value: string;
        currency: KolliderCurrencies; // BTC,
      };
      rate: null | {
        value: string;
        quote: KolliderCurrencies; // => Should be BTC, cause Alby sends only sats
        base: KolliderCurrencies; // => current account´s currency
      };
      error: string | null;
      payment_preimage: null | string;
      destination: null;
      description: null;
    }>("POST", "/payinvoice", {
      payment_request: args.paymentRequest,
      currency: this.config.currency,
    });

    if (data.error) {
      throw new Error(data.error);
    }

    const amountInSats = getBTCToSats(data.amount?.value || 0).toString();
    const feesInSats = getBTCToSats(data.fees?.value || 0).toString();

    const payment_route = {
      total_amt: parseFloat(amountInSats),
      total_fees: parseFloat(feesInSats),
    };

    return {
      data: {
        preimage: data.payment_preimage || "",
        paymentHash: data.payment_hash,
        route: payment_route,
      },
    };
  }

  async keysend(args: KeysendArgs): Promise<SendPaymentResponse> {
    throw new Error(
      "Keysend is not supported with the currently used account."
    );
  }

  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    const data = await this.request<{
      paid: boolean;
    }>("GET", `/checkpayment`, {
      payment_hash: args.paymentHash,
    });

    return {
      data: {
        paid: !!data?.paid,
      },
    };
  }

  signMessage(args: SignMessageArgs): Promise<SignMessageResponse> {
    // make sure we got the config to create a new key
    if (!this.config.username || !this.config.password) {
      return Promise.reject(new Error("Missing config"));
    }
    if (!args.message) {
      return Promise.reject(new Error("Invalid message"));
    }
    const message = sha256(args.message).toString(Hex);
    const keyHex = sha256(
      `kollider://${this.config.username}:${this.config.password}`
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
        message: args.message,
        signature: signedMessageDERHex,
      },
    });
  }

  async makeInvoice(args: MakeInvoiceArgs): Promise<MakeInvoiceResponse> {
    const amountInBTC = getSatsToBTC(args.amount);

    const data = await this.request<{
      req_id: string;
      uid: number;
      payment_request: string;
      payment_hash: string;
      meta: string; // => memo
      metadata: null;
      amount: null | {
        value: string;
        currency: string;
      };
      rate: null;
      currency: KolliderCurrencies; // BTC
      target_account_currency: KolliderCurrencies; // => this account's currency
      account_id: string;
      error: string;
      fees: null;
    }>("GET", "/addinvoice", {
      amount: amountInBTC,
      currency: "BTC", // Has to be BTC, Alby sends sats only
      target_account_currency: this.currency,
      account_id: this.currentAccountId,
      meta: args.memo,
    });

    if (data.error) {
      throw new Error(data.error);
    }

    return {
      data: {
        paymentRequest: data.payment_request,
        rHash: data.payment_hash,
      },
    };
  }

  async authorize() {
    const { data: authData } = await axios.post(
      `${API_URL}/auth`,
      {
        username: this.config.username,
        password: this.config.password,
      },
      {
        headers: defaultHeaders,
        adapter: fetchAdapter,
      }
    );

    if (authData.error || authData.errors) {
      const error = authData.error || authData.errors;
      const errMessage = error?.errors?.[0]?.message || error?.[0]?.message;

      console.error(errMessage);
      throw new Error("Kollider API error: " + errMessage);
    } else {
      this.refresh_token = authData.refresh;
      this.access_token = authData.token;
      this.refresh_token_created = +new Date();
      this.access_token_created = +new Date();

      return authData;
    }
  }

  async loadAccounts() {
    const response = await this.request<{
      uid: number;
      error: string | null;
      accounts: Record<string, KolliderAccount>;
    }>("GET", "/balance", undefined);
    this.accounts = response.accounts;
  }

  async findAccount(currency: string): Promise<KolliderAccount | null> {
    const accountId = await this.findAccountId(currency);
    if (accountId && this.accounts) {
      return this.accounts[accountId];
    } else {
      return null;
    }
  }

  async findAccountId(currency: string): Promise<string | null> {
    if (!this.accounts) {
      await this.loadAccounts();
    }
    // guess only for typescript. loadAccounts loads the accounts :)
    if (!this.accounts) {
      return null;
    }
    const accounts = this.accounts; // just to use in the find()
    const accountIds = Object.keys(this.accounts);
    const currentAccountId = accountIds.find((id) => {
      return accounts[id].currency === currency;
    });
    return currentAccountId || null;
  }

  async request<Type>(
    method: Method,
    path: string,
    args?: Record<string, unknown>
  ): Promise<Type> {
    if (!this.access_token) {
      await this.authorize();
    }

    const reqConfig: AxiosRequestConfig = {
      method,
      url: `${API_URL}${path}`,
      responseType: "json",
      adapter: fetchAdapter,
      headers: {
        ...defaultHeaders,
        Authorization: `${this.access_token}`,
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

        const errorMessage = `${errResponse?.data.error}\n(${e.message})`;
        throw new Error(errorMessage);
      }
    }
    return data;
  }
}
