import axios, { AxiosRequestConfig, Method } from "axios";
import type { AxiosResponse } from "axios";
import Hex from "crypto-js/enc-hex";
import sha256 from "crypto-js/sha256";
import { ACCOUNT_CURRENCIES } from "~/common/constants";
import { getBTCToSats, getSatsToBTC } from "~/common/utils/currencyConvert";
import HashKeySigner from "~/common/utils/signer";

import Connector, {
  CheckPaymentArgs,
  CheckPaymentResponse,
  GetBalanceResponse,
  ConnectPeerResponse,
  GetInfoResponse,
  GetInvoicesResponse,
  ConnectorInvoice,
  KeysendArgs,
  MakeInvoiceArgs,
  MakeInvoiceResponse,
  SendPaymentArgs,
  SendPaymentResponse,
  SignMessageArgs,
  SignMessageResponse,
} from "./connector.interface";

const API_URL = "https://lndhubx.kollider.xyz/api";

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
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

export default class Kollider implements Connector {
  config: Config;
  access_token?: string;
  access_token_created?: number;
  refresh_token?: string;
  refresh_token_created?: number;
  noRetry?: boolean;
  accounts: Record<KolliderAccount["account_id"], KolliderAccount> | undefined;
  currency: KolliderCurrencies;
  currentAccountId: string | null;

  constructor(config: Config) {
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

  async getInvoices(): Promise<GetInvoicesResponse> {
    const data = await this.request<
      {
        account_id: string;
        add_index: number;
        created_at: number;
        currency: KolliderCurrencies;
        expiry: number;
        fees: null; // FIXME! Why is this null?
        incoming: boolean;
        owner: number;
        payment_hash: string;
        payment_request: string;
        reference: string;
        settled: boolean; // Bug: Currently always false
        settled_date: number; // Bug: Currently always 0
        target_account_currency: KolliderCurrencies;
        uid: number;
        value: number;
        value_msat: number;
      }[]
    >("GET", "/getuserinvoices", undefined);

    const invoices: ConnectorInvoice[] = data
      .filter((i) => i.incoming)
      .map(
        (invoice, index): ConnectorInvoice => ({
          id: `${invoice.payment_hash}-${index}`,
          memo: invoice.reference,
          preimage: "", // lndhub doesn't support preimage (yet)
          settled: true, // Bug: Incoming invoices are not marked as settled and have no settled_date! Now, invoices which are NOT SETTLED are rendered too
          settleDate: invoice.created_at, // BUG: here it should be settled_date, which is currently always 0! Also: created_at is set to Monday, 28. November 2022, propably because kollider ported all accounts on that day
          totalAmount: `${invoice.value}`,
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
    return { data: { alias: `Kollider ${this.currency}` } };
  }

  async getBalance(): Promise<GetBalanceResponse> {
    await this.loadAccounts();
    const account = await this.findAccount(this.currency);

    if (!account) {
      throw new Error("Account not found");
    }

    let balance = account.balance;

    if (account.currency === "BTC") {
      balance = getBTCToSats(account.balance).toString();
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
    throw new Error(
      "CheckPayment is not supported with the currently used account."
    );
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
        rHash: "", // TODO! This calls checkPayment later which is not working yet! Also: payment hash is missing in makeInvoide response
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
      url: `${API_URL}/${path}`,
      responseType: "json",
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
