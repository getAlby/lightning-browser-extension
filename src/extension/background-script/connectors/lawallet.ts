import { schnorr } from "@noble/curves/secp256k1";
import fetchAdapter from "@vespaiach/axios-fetch-adapter";
import type { AxiosResponse, ResponseType } from "axios";
import axios, { AxiosRequestConfig, Method } from "axios";
import lightningPayReq from "bolt11";
import Hex from "crypto-js/enc-hex";
import sha256 from "crypto-js/sha256";
import {
  SimplePool,
  finishEvent,
  getPublicKey,
  type Event,
  type EventTemplate,
} from "nostr-tools";
import { Account } from "~/types";

import toast from "~/app/components/Toast";
import Connector, {
  CheckPaymentArgs,
  CheckPaymentResponse,
  ConnectPeerResponse,
  ConnectorTransaction,
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
  privateKey: string;
  apiEndpoint: string;
  identityEndpoint: string;
  ledgerPublicKey: string;
  urlxPublicKey: string;
  relayList: string[];
}

const defaultHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "X-User-Agent": "alby-extension",
};

export default class LaWallet implements Connector {
  account: Account;
  config: Config;
  relay_pool: SimplePool;
  public_key: string;
  access_token?: string;
  access_token_created?: number;
  refresh_token?: string;
  refresh_token_created?: number;
  noRetry?: boolean;

  constructor(account: Account, config: Config) {
    this.account = account;
    this.config = config;
    this.public_key = getPublicKey(config.privateKey);
    this.relay_pool = new SimplePool();
    this.relay_pool.ensureRelay(this.config.relayList[0]);
  }

  async init() {
    return Promise.resolve();
  }

  unload() {
    this.relay_pool.close(this.config.relayList);
    return Promise.resolve();
  }

  get supportedMethods() {
    return [
      "getInfo",
      "makeInvoice",
      "sendPayment",
      "signMessage",
      "getInvoices",
      "getBalance",
    ];
  }

  async connectPeer(): Promise<ConnectPeerResponse> {
    console.error(
      `${this.constructor.name} does not implement the getInvoices call`
    );
    throw new Error("Not yet supported with the currently used account.");
  }

  private async getInvoices(): Promise<ConnectorTransaction[]> {
    const transactions: ConnectorTransaction[] = (await this.getTransactions())
      .data.transactions;

    return transactions.filter(
      (transaction) => transaction.type === "received"
    );
  }

  async getTransactions(): Promise<GetTransactionsResponse> {
    const transactions = await this.relay_pool.list(this.config.relayList, [
      {
        authors: [this.config.ledgerPublicKey],
        kinds: [1112],
        since: 0,
        "#t": ["internal-transaction-ok", "inbound-transaction-ok"],
        "#p": [this.public_key],
      },
    ]);

    return {
      data: {
        transactions: transactions
          .map(parseTransaction.bind(this, this.public_key))
          .sort((a, b) => b.settleDate - a.settleDate),
      },
    };
  }

  private async getPayments(): Promise<ConnectorTransaction[]> {
    const transactions: ConnectorTransaction[] = (await this.getTransactions())
      .data.transactions;

    return transactions.filter((transaction) => transaction.type === "sent");
  }

  async getInfo(): Promise<GetInfoResponse> {
    const { username } = await this.requestIdentity<{ username: string }>(
      "GET",
      `/api/pubkey/${this.public_key}`,
      undefined
    );
    return {
      data: {
        alias: username,
        pubkey: this.public_key,
      },
    };
  }

  async getBalance(): Promise<GetBalanceResponse> {
    const balanceEvent = await this.relay_pool.get(this.config.relayList, {
      authors: [this.config.ledgerPublicKey],
      kinds: [31111],
      "#d": [`balance:BTC:${this.public_key}`],
    });

    return {
      data: {
        balance: balanceEvent
          ? parseInt(
              balanceEvent?.tags.find(
                (tag) => tag[0] === "amount"
              )?.[1] as string
            ) / 1000
          : 0,
      },
    };
  }

  async sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse> {
    const paymentRequestDetails = lightningPayReq.decode(args.paymentRequest);

    const unsignedEvent: EventTemplate = {
      kind: 1112,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["t", "internal-transaction-start"],
        ["p", this.config.ledgerPublicKey],
        ["p", this.config.urlxPublicKey],
        ["bolt11", args.paymentRequest],
      ],
      content: JSON.stringify({
        tokens: { BTC: paymentRequestDetails.millisatoshis?.toString() },
      }),
    };

    const event: Event = finishEvent(unsignedEvent, this.config.privateKey);

    try {
      await this.requestApi("POST", "/nostr/publish", { body: event }, "blob");

      const amountInSats = paymentRequestDetails.satoshis || 0;
      const payment_route = { total_amt: amountInSats, total_fees: 0 };
      return {
        data: {
          preimage: "",
          paymentHash: paymentRequestDetails.paymentRequest as string,
          route: payment_route,
        },
      };
    } catch (e) {
      console.error(e);
      console.error(e);
      if (e instanceof Error) toast.error(`${e.message}`);
      throw e;
    }
  }

  async keysend(args: KeysendArgs): Promise<SendPaymentResponse> {
    console.error(
      `${this.constructor.name} does not implement the keysend call`
    );
    throw new Error("Keysend not yet supported.");
  }

  // Needs implementation on server side
  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    try {
      await this.requestApi<{ paid: boolean }>(
        "GET",
        `/urlx/${args.paymentHash}`,
        undefined
      );
      return {
        data: {
          paid: true,
        },
      };
    } catch (e) {
      return {
        data: {
          paid: false,
        },
      };
    }
  }

  signMessage(args: SignMessageArgs): Promise<SignMessageResponse> {
    if (!this.config.apiEndpoint || !this.config.privateKey) {
      return Promise.reject(new Error("Missing config"));
    }
    if (!args.message) {
      return Promise.reject(new Error("Invalid message"));
    }

    return Promise.resolve({
      data: {
        message: args.message,
        signature: schnorr
          .sign(sha256(args.message).toString(Hex), this.config.privateKey)
          .toString(),
      },
    });
  }

  async makeInvoice(args: MakeInvoiceArgs): Promise<MakeInvoiceResponse> {
    const data = await this.requestApi<{
      pr: string;
    }>("GET", `/lnurlp/${this.public_key}/callback`, {
      amount: (args.amount as number) * 1000,
      comment: args.memo,
    });

    return {
      data: {
        paymentRequest: data.pr,
        rHash: Buffer.from(data.pr).toString("hex"),
      },
    };
  }

  async requestApi<Type>(
    method: Method,
    path: string,
    args?: Record<string, unknown>,
    responseType?: ResponseType
  ): Promise<Type> {
    return this.request<Type>(
      this.config.apiEndpoint,
      method,
      path,
      args,
      responseType
    );
  }

  async requestIdentity<Type>(
    method: Method,
    path: string,
    args?: Record<string, unknown>,
    responseType?: ResponseType
  ): Promise<Type> {
    return this.request<Type>(
      this.config.identityEndpoint,
      method,
      path,
      args,
      responseType
    );
  }

  async request<Type>(
    url: string,
    method: Method,
    path: string,
    args?: Record<string, unknown>,
    responseType: ResponseType = "json"
  ): Promise<Type> {
    const reqConfig: AxiosRequestConfig = {
      method,
      url: `${url}${path}`,
      responseType,
      headers: {
        ...defaultHeaders,
      },
      adapter: fetchAdapter,
    };

    if (method === "POST") {
      reqConfig.data = args?.body || {};
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

        console.error(e);
        throw new Error(errResponse.data.message);
      }

      throw e;
    }

    return data;
  }
}

interface TransactionEventContent {
  tokens: { BTC: number };
}

function parseTransaction(
  userPubkey: string,
  event: Event
): ConnectorTransaction {
  return {
    id: event.id,
    preimage: "",
    settled: true,
    settleDate: event.created_at * 1000,
    totalAmount:
      (JSON.parse(event.content) as TransactionEventContent).tokens.BTC / 1000,
    type: event.tags[1][1] === userPubkey ? "received" : "sent",
    custom_records: {},
    memo: "",
    payment_hash: "",
  };
}
