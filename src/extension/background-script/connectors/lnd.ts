import Base64 from "crypto-js/enc-base64";
import UTF8 from "crypto-js/enc-utf8";
import utils from "../../../common/lib/utils";
import Connector, {
  SendPaymentArgs,
  SendPaymentResponse,
  CheckPaymentArgs,
  CheckPaymentResponse,
  GetInfoResponse,
  GetBalanceResponse,
  MakeInvoiceArgs,
  MakeInvoiceResponse,
  SignMessageArgs,
  SignMessageResponse,
  VerifyMessageArgs,
  VerifyMessageResponse,
} from "./connector.interface";

interface Config {
  macaroon: string;
  url: string;
}

class Lnd implements Connector {
  config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  init() {
    return Promise.resolve();
  }
  unload() {
    return Promise.resolve();
  }

  getInfo(): Promise<GetInfoResponse> {
    return this.request<{
      alias: string;
      identity_pubkey: string;
      color: string;
    }>("GET", "/v1/getinfo", undefined, {}).then((data) => {
      return {
        data: {
          alias: data.alias,
          pubkey: data.identity_pubkey,
          color: data.color,
        },
      };
    });
  }

  getBalance(): Promise<GetBalanceResponse> {
    return this.getChannelsBalance();
  }

  sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse> {
    return this.request<{
      payment_preimage: string;
      payment_hash: string;
      payment_route: { total_amt: number; total_fees: number };
      payment_error?: string;
    }>(
      "POST",
      "/v1/channels/transactions",
      {
        payment_request: args.paymentRequest,
      },
      {}
    ).then((data) => {
      if (data.payment_error) {
        return { error: data.payment_error };
      }
      return {
        data: {
          preimage: utils.base64ToHex(data.payment_preimage),
          paymentHash: utils.base64ToHex(data.payment_hash),
          route: data.payment_route,
        },
      };
    });
  }

  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    const data = await this.request<{ settled: boolean }>(
      "GET",
      `/v1/invoice/${args.paymentHash}`
    );
    return {
      data: {
        paid: data.settled,
      },
    };
  }

  signMessage(args: SignMessageArgs): Promise<SignMessageResponse> {
    // use v2 to use the key locator (key_loc)
    // return this.request("POST", "/v2/signer/signmessage", {
    return this.request<{ signature: string }>("POST", "/v1/signmessage", {
      msg: Base64.stringify(UTF8.parse(args.message)),
    }).then((data) => {
      return {
        data: {
          message: args.message,
          signature: data.signature,
        },
      };
    });
  }

  verifyMessage(args: VerifyMessageArgs): Promise<VerifyMessageResponse> {
    return this.request<{ valid: boolean }>("POST", "/v1/verifymessage", {
      msg: Base64.stringify(UTF8.parse(args.message)),
      signature: args.signature,
    }).then((data) => {
      return {
        data: {
          valid: data.valid,
        },
      };
    });
  }

  makeInvoice(args: MakeInvoiceArgs): Promise<MakeInvoiceResponse> {
    return this.request<{ payment_request: string; r_hash: string }>(
      "POST",
      "/v1/invoices",
      {
        memo: args.memo,
        value: args.amount,
      }
    ).then((data) => {
      return {
        data: {
          paymentRequest: data.payment_request,
          rHash: utils.base64ToHex(data.r_hash),
        },
      };
    });
  }

  getAddress() {
    return this.request("POST", "/v2/wallet/address/next", undefined, {});
  }

  getBlockchainBalance = () => {
    return this.request("GET", "/v1/balance/blockchain", undefined, {
      unconfirmed_balance: "0",
      confirmed_balance: "0",
      total_balance: "0",
    });
  };

  getChannelsBalance = () => {
    return this.request<{ balance: number; pending_open_balance: number }>(
      "GET",
      "/v1/balance/channels",
      undefined,
      {
        pending_open_balance: "0",
        balance: "0",
      }
    ).then((data) => {
      return {
        data: {
          balance: data.balance,
          pending_open_balance: data.pending_open_balance,
        },
      };
    });
  };

  getTransactions = () => {
    return this.request("GET", "/v1/payments", undefined, {
      transactions: [],
    });
  };

  async request<Type>(
    method: string,
    path: string,
    args?: Record<string, unknown>,
    defaultValues?: Record<string, unknown>
  ): Promise<Type> {
    const url = new URL(this.config.url);
    url.pathname = path;
    let body = null;
    const headers = new Headers();
    headers.append("Accept", "application/json");
    if (method === "POST") {
      body = JSON.stringify(args);
      headers.append("Content-Type", "application/json");
    } else if (args !== undefined) {
      url.search = new URLSearchParams(
        args as Record<string, string>
      ).toString();
    }
    if (this.config.macaroon) {
      headers.append("Grpc-Metadata-macaroon", this.config.macaroon);
    }
    const res = await fetch(url.toString(), {
      method,
      headers,
      body,
    });
    if (!res.ok) {
      let errBody;
      try {
        errBody = await res.json();
        if (!errBody.error) {
          throw new Error();
        }
      } catch (err) {
        throw new Error(res.statusText);
      }
      console.log("errBody", errBody);
      throw errBody;
    }
    let data = await res.json();
    if (defaultValues) {
      data = Object.assign(Object.assign({}, defaultValues), data);
    }
    return data;
  }
}

export default Lnd;
