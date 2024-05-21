import lightningPayReq from "bolt11-signet";
import Hex from "crypto-js/enc-hex";
import sha256 from "crypto-js/sha256";
import HashKeySigner from "~/common/utils/signer";
import { Account } from "~/types";

import Connector, {
  CheckPaymentArgs,
  CheckPaymentResponse,
  ConnectorTransaction,
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
  adminkey: string;
  url: string;
}

class LnBits implements Connector {
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
      "makeInvoice",
      "sendPayment",
      "sendPaymentAsync",
      "signMessage",
      "getBalance",
    ];
  }

  getInfo(): Promise<GetInfoResponse> {
    return this.request(
      "GET",
      "/api/v1/wallet",
      this.config.adminkey,
      undefined
    ).then((data) => {
      return {
        data: {
          alias: data.name,
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

  /*
  LNBits Swagger Docs: https://legend.lnbits.org/devs/swagger.html#/default/api_payments_api_v1_payments_get
  Sample Response:
    [
      {
        "checking_id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "pending": false,
        "amount": 2000,
        "fee": 0,
        "memo": "LNbits",
        "time": 1000000000,
        "bolt11-signet": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "preimage": "0000000000000000000000000000000000000000000000000000000000000000",
        "payment_hash": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "extra": {},
        "wallet_id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        "webhook": null,
        "webhook_status": null
      }
    ]
  */

  getTransactions(): Promise<GetTransactionsResponse> {
    return this.request(
      "GET",
      "/api/v1/payments",
      this.config.adminkey,
      undefined
    ).then(
      (
        data: {
          checking_id: string;
          pending: boolean;
          amount: number;
          fee: number;
          memo: string;
          time: number;
          bolt11: string;
          preimage: string;
          payment_hash: string;
          wallet_id: string;
          webhook: string;
          webhook_status: string;
        }[]
      ) => {
        const transactions: ConnectorTransaction[] = data.map(
          (transaction, index): ConnectorTransaction => {
            return {
              id: `${transaction.checking_id}-${index}`,
              memo: transaction.memo,
              preimage:
                transaction.preimage !=
                "0000000000000000000000000000000000000000000000000000000000000000"
                  ? transaction.preimage
                  : "",
              payment_hash: transaction.payment_hash,
              settled: !transaction.pending,
              settleDate: transaction.time * 1000,
              totalAmount: Math.abs(Math.floor(transaction.amount / 1000)),
              type: transaction.amount > 0 ? "received" : "sent",
            };
          }
        );

        return {
          data: {
            transactions,
          },
        };
      }
    );
  }

  getBalance(): Promise<GetBalanceResponse> {
    return this.request(
      "GET",
      "/api/v1/wallet",
      this.config.adminkey,
      undefined
    ).then((data) => {
      const balanceInSats = Math.floor(data.balance / 1000);
      return {
        data: {
          balance: balanceInSats,
        },
      };
    });
  }

  sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse> {
    const paymentRequestDetails = lightningPayReq.decode(args.paymentRequest);
    const amountInSats = paymentRequestDetails.satoshis || 0;
    return this.request("POST", "/api/v1/payments", this.config.adminkey, {
      bolt11: args.paymentRequest,
      out: true,
    }).then((data) => {
      // TODO: how do we get the total amount here??
      return this.checkPayment({ paymentHash: data.payment_hash }).then(
        ({ data: checkData }) => {
          return {
            data: {
              preimage: checkData?.preimage || "",
              paymentHash: data.payment_hash,
              route: { total_amt: amountInSats, total_fees: 0 },
            },
          };
        }
      );
    });
  }
  async keysend(args: KeysendArgs): Promise<SendPaymentResponse> {
    throw new Error("not supported");
  }
  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    const data = await this.request(
      "GET",
      `/api/v1/payments/${args.paymentHash}`,
      this.config.adminkey
    );
    return {
      data: {
        paid: data.isPaid,
        ...data,
      },
    };
  }

  signMessage(args: SignMessageArgs): Promise<SignMessageResponse> {
    // make sure we got the config to create a new key
    if (!this.config.url || !this.config.adminkey) {
      return Promise.reject(new Error("Missing config"));
    }
    if (!args.message) {
      return Promise.reject(new Error("Invalid message"));
    }
    const message = sha256(args.message).toString(Hex);
    // create a signing key from the lnbits adminkey
    const keyHex = sha256(`lnbits://${this.config.adminkey}`).toString(Hex);

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

  makeInvoice(args: MakeInvoiceArgs): Promise<MakeInvoiceResponse> {
    return this.request("POST", "/api/v1/payments", this.config.adminkey, {
      amount: args.amount,
      memo: args.memo,
      out: false,
    }).then((data) => {
      return {
        data: {
          paymentRequest: data.payment_request,
          rHash: data.payment_hash,
        },
      };
    });
  }

  async request(
    method: string,
    path: string,
    apiKey: string,
    args?: Record<string, unknown>
  ) {
    let body = null;
    let query = "";
    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/json");
    headers.append("X-Api-Key", apiKey);

    if (method === "POST") {
      body = JSON.stringify(args);
    } else if (args !== undefined) {
      query = `?`; //`?${stringify(args)}`;
    }
    const res = await fetch(this.config.url + path + query, {
      method,
      headers,
      body,
    });
    if (!res.ok) {
      const errBody = await res.json();
      console.error("errBody", errBody);
      throw new Error(errBody.detail);
    }
    return await res.json();
  }
}

export default LnBits;
