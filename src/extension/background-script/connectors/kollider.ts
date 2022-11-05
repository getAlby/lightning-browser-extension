import axios, { AxiosRequestConfig, Method } from "axios";
import type { AxiosResponse } from "axios";
import Hex from "crypto-js/enc-hex";
import sha256 from "crypto-js/sha256";
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

interface Config {
  username: string;
  password: string;
  currency: string;
}

interface KolliderAccount {
  account_id: string;
  balance: string;
  currency: string;
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
  accounts: Record<string, KolliderAccount> | undefined;
  currency: string;
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
      `${this.constructor.name} does not implement the getInvoices call`
    );
    throw new Error("Not yet supported with the currently used account.");
  }

  async getInvoices(): Promise<GetInvoicesResponse> {
    const data = await this.request<
      {
        r_hash: string;
        payment_request: string;
        payment_hash: string;
        created_at: number;
        value: number;
        value_msat: number;
        expiry: number;
        settled: boolean;
        add_index: number;
        settled_date: number;
        account_id: string;
        uid: number;
        incoming: boolean;
        owner: number;
        fees: FixMe;
        currency: string;
        target_account_currency: string;
      }[]
    >("GET", "/getuserinvoices", undefined);

    const invoices: ConnectorInvoice[] = data
      .filter((i) => i.incoming)
      .map(
        (invoice, index): ConnectorInvoice => ({
          id: `${invoice.r_hash}-${index}`,
          memo: "",
          preimage: "", // lndhub doesn't support preimage (yet)
          settled: invoice.settled,
          settleDate: invoice.settled_date * 1000,
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

    const balance = parseFloat(account.balance);
    return {
      data: {
        balance,
        //currency: account.currency,
      },
    };
  }

  async sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse> {
    const data = await this.request<{
      error?: string;
      success: boolean;
      payment_hash: string;
      uid: string;
      currency: string;
      payment_request: string;
      amount: string;
      fees: string;
      rate: string;
    }>("POST", "/payinvoice", {
      payment_request: args.paymentRequest,
      currency: this.config.currency,
    });
    if (data.error) {
      throw new Error(data.error);
    }
    const payment_route = {
      total_amt: parseFloat(data.amount),
      total_fees: parseFloat(data.fees),
    };
    return {
      data: {
        preimage: "", // data.payment_preimage as string,
        paymentHash: data.payment_hash,
        route: payment_route,
      },
    };
  }

  async keysend(args: KeysendArgs): Promise<SendPaymentResponse> {
    throw new Error("Not yet supported with the currently used account.");
  }

  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    throw new Error("Not yet supported with the currently used account.");
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
    let keyHex = sha256(
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
    const amount = parseFloat(args.amount.toString()) / 100000000;
    const data = await this.request<{
      payment_request: string;
      uid: number;
      meta: string;
      amount: string;
      rate: string;
      currency: string;
      target_account_currency: string;
      account_id: string;
      error: string | undefined;
      fees: string;
    }>("GET", "/addinvoice", {
      amount: amount,
      currency: "BTC",
      account_id: this.currentAccountId,
      meta: args.memo,
    });
    return {
      data: {
        paymentRequest: data.payment_request,
        rHash: "", //TODO
      },
    };
  }

  async authorize() {
    const { data: authData } = await axios.post(
      `https://lndhubx.kollider.xyz/api/auth`,
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
      throw new Error("API error: " + errMessage);
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
      url: `https://lndhubx.kollider.xyz/api${path}`,
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
