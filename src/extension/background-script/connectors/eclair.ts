import Base64 from "crypto-js/enc-base64";
import UTF8 from "crypto-js/enc-utf8";
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

class Eclair implements Connector {
  account: Account;
  config: Config;

  constructor(account: Account, config: Config) {
    this.account = account;
    this.config = config;
  }

  init() {
    return Promise.resolve();
  }

  unload() {
    return Promise.resolve();
  }

  get supportedMethods() {
    return [
      "getInfo",
      "keysend",
      "makeInvoice",
      "sendPayment",
      "sendPaymentAsync",
      "signMessage",
      "getBalance",
    ];
  }

  getInfo(): Promise<GetInfoResponse> {
    return this.request("/getinfo", undefined).then((data) => {
      return {
        data: {
          alias: data.alias,
          pubkey: data.nodeId,
          color: data.color,
        },
      };
    });
  }

  // not yet implemented
  async connectPeer(): Promise<ConnectPeerResponse> {
    console.error(
      `${this.constructor.name} does not implement the getInvoices call`
    );
    throw new Error("Not yet supported with the currently used account.");
  }

  async getTransactions(): Promise<GetTransactionsResponse> {
    console.error(
      `getTransactions() is not yet supported with the currently used account: ${this.constructor.name}`
    );
    return { data: { transactions: [] } };
  }

  async getBalance(): Promise<GetBalanceResponse> {
    const balances = await this.request("/usablebalances");
    const total = balances
      .map((balance: Record<string, number>) => balance.canSend || 0)
      .reduce((acc: number, b: number) => acc + b, 0);
    return {
      data: {
        balance: Math.floor(total / 1000),
      },
    };
  }

  async sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse> {
    const { paymentHash, paymentPreimage } = await this.request("/payinvoice", {
      invoice: args.paymentRequest,
      blocking: true,
    });

    const info = await this.request("/getsentinfo", {
      paymentHash,
    });
    const { status, recipientAmount } = info[info.length - 1];

    return {
      data: {
        preimage: paymentPreimage,
        paymentHash,
        route: {
          total_amt: Math.floor(recipientAmount / 1000),
          total_fees: Math.floor(status.feesPaid / 1000),
        },
      },
    };
  }

  async keysend(args: KeysendArgs): Promise<SendPaymentResponse> {
    throw new Error("not supported");
  }
  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    const data = await this.request("/getreceivedinfo", {
      paymentHash: args.paymentHash,
    });

    return {
      data: {
        paid: data && data.status.type === "received",
      },
    };
  }

  async signMessage(args: SignMessageArgs): Promise<SignMessageResponse> {
    const { signature } = await this.request("/signmessage", {
      msg: Base64.stringify(UTF8.parse(args.message)),
    });

    return {
      data: {
        message: args.message,
        signature: signature as string,
      },
    };
  }

  async makeInvoice(args: MakeInvoiceArgs): Promise<MakeInvoiceResponse> {
    const res = await this.request("/createinvoice", {
      description: args.memo,
      amountMsat: +args.amount * 1000,
    });

    return {
      data: {
        paymentRequest: res.serialized,
        rHash: res.paymentHash,
      },
    };
  }

  async request(path: string, params?: Record<string, unknown>) {
    const url = new URL(
      this.config.url.startsWith("http")
        ? this.config.url
        : "http://" + this.config.url
    );
    url.pathname = path;
    const headers = new Headers();
    headers.append("Accept", "application/json");
    const password = Base64.stringify(UTF8.parse(":" + this.config.password));
    headers.append("Authorization", "Basic " + password);

    const body = new FormData();
    if (params) {
      for (const k in params) {
        body.append(k, params[k] as string);
      }
    }

    const res = await fetch(url.toString(), {
      method: "POST",
      headers,
      body,
    });

    if (!res.ok) {
      let errBody;
      try {
        const textBody = await res.text();
        try {
          errBody = JSON.parse(textBody);
          if (!errBody.error) {
            throw new Error("error response: " + textBody.slice(0, 200));
          }
        } catch (err) {
          throw new Error("got a non-JSON response: " + textBody.slice(0, 200));
        }
      } catch (err) {
        throw new Error(res.statusText);
      }
      console.error("eclair error", errBody.error);
      throw new Error(errBody.error);
    }

    return await res.json();
  }
}

export default Eclair;
