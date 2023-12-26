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

interface Config {
  url: string;
  password: string;
}

type RequestFunction = <ResponseType = unknown>(
  jwt: string,
  method: string,
  path: string,
  args?: Record<string, unknown>
) => Promise<ResponseType>;

class CitadelConnector implements Connector {
  account: Account;
  config: Config;
  jwt: string;

  constructor(account: Account, config: Config) {
    this.account = account;
    this.config = config;
    this.jwt = "";
  }

  protected _requestFunc?: RequestFunction;
  set requestFunc(requestFunc: RequestFunction) {
    this._requestFunc = requestFunc;
  }

  init() {
    return Promise.resolve();
  }

  unload() {
    return Promise.resolve();
  }

  get supportedMethods() {
    return [
      "makeInvoice",
      "sendPayment",
      "sendPaymentAsync",
      "signMessage",
      "getInfo",
      "getBalance",
    ];
  }

  async getInfo(): Promise<GetInfoResponse> {
    await this.ensureLogin();
    return this.request("GET", "api/v1/lnd/info").then((data) => {
      return {
        data: {
          alias: data.alias,
          pubkey: data.identityPubkey,
          color: data.color,
        },
      };
    });
  }

  async getTransactions(): Promise<GetTransactionsResponse> {
    console.error(
      `getTransactions() is not yet supported with the currently used account: ${this.constructor.name}`
    );
    return { data: { transactions: [] } };
  }

  // not yet implemented
  async connectPeer(): Promise<ConnectPeerResponse> {
    console.error(
      `${this.constructor.name} does not implement the getInvoices call`
    );
    throw new Error("Not yet supported with the currently used account.");
  }

  async getBalance(): Promise<GetBalanceResponse> {
    await this.ensureLogin();
    return this.request("GET", "api/v1/lnd/wallet/lightning").then((data) => {
      const balance = parseInt(data.localBalance?.sat as string);
      return {
        data: {
          balance,
        },
      };
    });
  }
  async keysend(args: KeysendArgs): Promise<SendPaymentResponse> {
    throw new Error("not supported");
  }
  async sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse> {
    await this.ensureLogin();
    return this.request("POST", "api/v1/lnd/lightning/payInvoice", {
      paymentRequest: args.paymentRequest,
    }).then((data) => {
      return {
        data: {
          preimage: data.paymentPreimage,
          paymentHash: data.paymentHash,
          route: {
            total_amt: Math.floor(
              parseInt(data.paymentRoute?.totalAmtMsat as string) / 1000
            ),
            total_fees: parseInt(data.paymentRoute?.totalFeesMsat as string),
          },
        },
      };
    });
  }

  async signMessage(args: SignMessageArgs): Promise<SignMessageResponse> {
    await this.ensureLogin();
    return this.request("POST", "api/v1/lnd/util/sign-message", {
      message: args.message,
    }).then((data) => {
      return {
        data: {
          message: args.message,
          signature: data.signature,
        },
      };
    });
  }

  protected async refresh(): Promise<string> {
    const data = await this.request("POST", "manager-api/v1/account/refresh");
    if (typeof data !== "object" || data === null || !data.jwt) {
      throw new Error("Failed to login.");
    }
    return data.jwt;
  }

  protected async login(password: string, totpToken: string): Promise<string> {
    const data = await this.request("POST", "manager-api/v1/account/login", {
      password,
      totpToken,
    });
    if (typeof data !== "object" || data === null || !data.jwt) {
      throw new Error("Failed to login.");
    }
    return data.jwt;
  }

  protected async ensureLogin() {
    try {
      this.jwt = await this.refresh();
    } catch {
      this.jwt = await this.login(this.config.password, "");
    }
  }

  async makeInvoice(args: MakeInvoiceArgs): Promise<MakeInvoiceResponse> {
    await this.ensureLogin();
    return this.request("POST", "api/v1/lnd/util/lightning/addInvoice", {
      memo: args.memo,
      amt: args.amount.toString(),
    }).then((data) => {
      return {
        data: {
          paymentRequest: data.paymentRequest,
          rHash: data.rHashStr,
        },
      };
    });
  }

  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    await this.ensureLogin();
    return this.request(
      "GET",
      `invoice-info?paymentHash=${args.paymentHash}`
    ).then((data) => {
      return {
        data: {
          paid: data.isPaid || data.state === 1,
        },
      };
    });
  }

  async request(method: string, path: string, args?: Record<string, unknown>) {
    const url =
      this.config.url + (this.config.url.endsWith("/") ? "" : "/") + path;

    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/json");
    if (this.jwt) headers.append("Authorization", `JWT ${this.jwt}`);

    const res = await fetch(url, {
      headers,
      method,
      ...(method !== "GET" ? { body: JSON.stringify(args) } : {}),
    });

    if (!res.ok) {
      const errBody = await res.json();
      console.error("errBody", errBody);
      throw new Error(errBody.detail);
    }
    return await res.json();
  }
}

export default CitadelConnector;
