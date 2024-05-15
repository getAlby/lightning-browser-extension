import { schnorr } from "@noble/curves/secp256k1";
import * as secp256k1 from "@noble/secp256k1";
import type { ResponseType } from "axios";
import { Method } from "axios";
import lightningPayReq from "bolt11-signet";
import Hex from "crypto-js/enc-hex";
import sha256 from "crypto-js/sha256";
import { nip04, relayInit, type Relay } from "nostr-tools";
import { Event, EventKind } from "~/extension/providers/nostr/types";
import { Account } from "~/types";

import toast from "~/app/components/Toast";
import { getEventHash } from "~/extension/background-script/actions/nostr/helpers";
import Nostr from "~/extension/background-script/nostr";
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
  relayUrl: string;
}

export class HttpError extends Error {
  status: number;
  error: Error | undefined;

  constructor(status: number, message: string, error?: Error) {
    super(message);
    this.status = status;
    this.error = error;
  }
}

export default class LaWallet implements Connector {
  account: Account;
  config: Config;
  relay: Relay;
  public_key: string;
  access_token?: string;
  access_token_created?: number;
  refresh_token?: string;
  refresh_token_created?: number;
  noRetry?: boolean;

  invoices_paid: InvoiceCache = {};
  last_invoice_check: number = 0;

  constructor(account: Account, config: Config) {
    this.account = account;
    this.config = config;
    this.public_key = new Nostr(config.privateKey).getPublicKey();
    this.relay = relayInit(config.relayUrl);
  }

  async init() {
    return Promise.resolve();
  }

  unload() {
    this.relay.close();
    return Promise.resolve();
  }

  get supportedMethods() {
    return [
      "getInfo",
      "makeInvoice",
      "sendPayment",
      "signMessage",
      "getBalance",
      "getTransactions",
    ];
  }

  async connectPeer(): Promise<ConnectPeerResponse> {
    console.error(
      `${this.constructor.name} does not implement the getInvoices call`
    );
    throw new Error("Not yet supported with the currently used account.");
  }

  async getTransactions(): Promise<GetTransactionsResponse> {
    const _transactions: Event[] = await LaWallet.request(
      this.config.apiEndpoint,
      "POST",
      "/nostr/fetch",
      {
        authors: [this.config.ledgerPublicKey, this.config.urlxPublicKey],
        kinds: [1112],
        since: 0,
        "#t": ["internal-transaction-ok", "inbound-transaction-start"],
        "#p": [this.public_key],
      }
    );

    const transactions = _transactions.map((event) => {
      return {
        ...event,
        kind: event.kind as EventKind,
      };
    }) as Event[];

    const parsedTransactions: ConnectorTransaction[] = await Promise.all(
      transactions.map(
        parseTransaction.bind(this, this.public_key, this.config.privateKey)
      )
    );

    return {
      data: {
        transactions: parsedTransactions.sort(
          (a, b) => b.settleDate - a.settleDate
        ),
      },
    };
  }

  async getInfo(): Promise<
    GetInfoResponse<{
      alias: string;
      pubkey: string;
      lightning_address: string;
    }>
  > {
    const { username, nodeAlias } = await LaWallet.request<{
      username: string;
      nodeAlias?: string;
    }>(
      this.config.identityEndpoint,
      "GET",
      `/api/pubkey/${this.public_key}`,
      undefined
    );
    const domain = this.config.identityEndpoint.replace("https://", "");
    return {
      data: {
        alias: nodeAlias || domain,
        pubkey: this.public_key,
        lightning_address: `${username}@${domain}`,
      },
    };
  }

  async getBalance(): Promise<GetBalanceResponse> {
    const filter = {
      authors: [this.config.ledgerPublicKey],
      kinds: [31111],
      "#d": [`balance:BTC:${this.public_key}`],
    };

    const events: Event[] = await LaWallet.request(
      this.config.apiEndpoint,
      "POST",
      "/nostr/fetch",
      filter
    );

    const balanceEvent = events[0];

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
    const unsignedEvent: Event = {
      kind: 1112 as EventKind,
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
      await LaWallet.request(
        this.config.apiEndpoint,
        "POST",
        "/nostr/publish",
        event,
        "blob"
      );
      this.relay.connect();
      return this.getPaymentStatus(event);
    } catch (e) {
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

  private onZapReceipt(event: Event) {
    const pr = event.tags.find((tag) => tag[0] === "bolt11")?.[1] as string;
    const paymentHash = lightningPayReq.decode(pr).tagsObject.payment_hash!;
    this.invoices_paid[paymentHash] = true;
  }

  private async getPaymentStatus(event: Event): Promise<SendPaymentResponse> {
    const paymentRequestDetails = lightningPayReq.decode(
      event.tags.find((tag) => tag[0] === "bolt11")?.[1] as string
    );
    const amountInSats = paymentRequestDetails.satoshis || 0;
    const payment_route = { total_amt: amountInSats, total_fees: 0 };

    await this.relay.connect();
    return new Promise((resolve, reject) => {
      const sub = this.relay.sub([
        {
          authors: [this.config.ledgerPublicKey, this.config.urlxPublicKey],
          "#e": [event.id!],
          "#t": [
            "internal-transaction-error",
            "internal-transaction-ok",
            "outbound-transaction-start",
          ],
        },
      ]);

      sub.on("event", async (event) => {
        const tag = event.tags.find((tag) => tag[0] === "t")![1];
        const content = JSON.parse(event.content);
        switch (tag) {
          case "internal-transaction-ok": // Refund
            if (event.tags[1][1] === this.public_key && !!content.memo) {
              return reject(new Error(content.memo));
            }
            break;
          case "internal-transaction-error": // No funds or ledger error
            return reject(new Error(content.messages[0]));
          case "outbound-transaction-start": // Payment done
            return resolve({
              data: {
                preimage: await extractPreimage(event, this.config.privateKey),
                paymentHash: paymentRequestDetails.tagsObject.payment_hash!,
                route: payment_route,
              },
            });
        }
      });
    });
  }

  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    const zapReceipts = await this.getZapReceipts(10, this.last_invoice_check);
    zapReceipts.forEach(this.onZapReceipt.bind(this));
    return {
      data: {
        paid: !!this.invoices_paid[args.paymentHash],
      },
    };
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
    const unsignedZapEvent = makeZapRequest({
      profile: this.public_key,
      event: null,
      amount: (args.amount as number) * 1000,
      comment: args.memo,
      relays: this.config.relayList,
    });

    const zapEvent: Event = finishEvent(
      unsignedZapEvent,
      this.config.privateKey
    );

    const params = {
      amount: String((args.amount as number) * 1000),
      comment: args.memo,
      nostr: JSON.stringify(zapEvent),
      lnurl: this.public_key,
    };

    const url = `/lnurlp/${this.public_key}/callback?${new URLSearchParams(
      params
    )}`;

    const data = await LaWallet.request<{
      pr: string;
    }>(this.config.apiEndpoint, "GET", url);

    const paymentRequestDetails = lightningPayReq.decode(data.pr);

    this.last_invoice_check = Math.floor(Date.now() / 1000);

    return {
      data: {
        paymentRequest: data.pr,
        rHash: paymentRequestDetails.tagsObject.payment_hash!,
      },
    };
  }

  private async getZapReceipts(
    limit: number = 10,
    since: number = 0
  ): Promise<Event[]> {
    const filter = {
      authors: [this.config.urlxPublicKey],
      kinds: [9735],
      since,
      limit,
      "#p": [this.public_key],
    };

    const zapEvents: Event[] = await LaWallet.request(
      this.config.apiEndpoint,
      "POST",
      "/nostr/fetch",
      filter
    );

    return zapEvents;
  }

  // Static Methods

  /**
   *
   * @param url The URL to fetch data from.
   * @param method HTTP Method
   * @param path API path
   * @param args POST arguments
   * @param responseType
   * @returns
   * @throws {HttpError} When the response has an HTTP error status.
   */
  static async request<Type>(
    url: string,
    method: Method,
    path: string,
    args: Record<string, unknown> = {},
    responseType: ResponseType = "json"
  ): Promise<Type> {
    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/json");

    let body = null;
    let res = null;

    if (method !== "GET") {
      body = JSON.stringify(args);
    }

    try {
      res = await fetch(`${url}${path}`, {
        headers,
        method,
        body,
      });
    } catch (e: unknown) {
      throw new HttpError(0, "Network error", e as Error);
    }

    if (!res.ok) {
      throw new HttpError(res.status, await res.text());
    }
    return await (responseType === "json" ? res.json() : res.text());
  }
}

interface TransactionEventContent {
  tokens: { BTC: number };
  memo?: string;
}

interface InvoiceCache {
  [paymentHash: string]: boolean; // paid
}

/** Utils Functions **/

async function extractPreimage(
  event: Event,
  privateKey: string
): Promise<string> {
  try {
    const encrypted = event.tags.find(
      (tag) => tag[0] === "preimage"
    )?.[1] as string;

    const messageKeyHex: string = await nip04.decrypt(
      privateKey,
      event.pubkey as string,
      encrypted
    );

    return messageKeyHex;
  } catch (e) {
    return "";
  }
}

export async function parseTransaction(
  userPubkey: string,
  privateKey: string,
  event: Event
): Promise<ConnectorTransaction> {
  const content = JSON.parse(event.content) as TransactionEventContent;
  // Get bolt11 tag
  const bolt11 = event.tags.find((tag) => tag[0] === "bolt11")?.[1] as string;

  let paymentHash = event.id;
  let memo = content.memo || "";

  // Check if the event is a payment request
  if (bolt11) {
    const paymentRequestDetails = lightningPayReq.decode(bolt11);
    paymentHash = paymentRequestDetails.tagsObject.payment_hash!;
    memo = paymentRequestDetails.tagsObject.description || memo;
  }

  return {
    id: event.id!,
    preimage: await extractPreimage(event, privateKey),
    settled: true,
    settleDate: event.created_at * 1000,
    totalAmount: content.tokens.BTC / 1000,
    type: event.tags[1][1] === userPubkey ? "received" : "sent",
    custom_records: {},
    memo: memo,
    payment_hash: paymentHash,
  };
}

export function makeZapRequest({
  profile,
  event,
  amount,
  relays = ["wss://relay.lawallet.ar"],
  comment = "",
}: {
  profile: string;
  event: string | null;
  amount: number;
  comment: string;
  relays: string[];
}): Event {
  if (!amount) throw new Error("amount not given");
  if (!profile) throw new Error("profile not given");

  const zr: Event = {
    kind: 9734,
    created_at: Math.round(Date.now() / 1000),
    content: comment,
    tags: [
      ["p", profile],
      ["amount", String(amount)],
      ["relays", ...relays],
    ],
  };

  if (event) {
    zr.tags.push(["e", event]);
  }

  return zr;
}

export function finishEvent(event: Event, privateKey: string): Event {
  event.pubkey = new Nostr(privateKey).getPublicKey();
  event.id = getEventHash(event);
  event.sig = signEvent(event, privateKey);
  return event;
}

export function signEvent(event: Event, key: string) {
  const signedEvent = schnorr.sign(getEventHash(event), key);
  return secp256k1.etc.bytesToHex(signedEvent);
}
