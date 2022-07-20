import Base64 from "crypto-js/enc-base64";
import Hex from "crypto-js/enc-hex";
import UTF8 from "crypto-js/enc-utf8";
import WordArray from "crypto-js/lib-typedarrays";
import SHA256 from "crypto-js/sha256";
import utils from "~/common/lib/utils";

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
  KeysendArgs,
  ConnectPeerArgs,
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
  // 020cd30d13d5011a08830d6ad2e54b4e220c7b20457c094701b09346052343f519@127.0.0.1:9738
  // 038a427acf097ca8853923d80c21472d85ae50114e3c3d531f2df2116e52aee106@127.0.0.1:8082
  connectPeer(args: ConnectPeerArgs): Promise<any> {
    // return this.request<any>(
    //   "DELETE",
    //   "/v1/peers/020cd30d13d5011a08830d6ad2e54b4e220c7b20457c094701b09346052343f519"
    // ).then((data) => {
    //   console.log("DATA: ", data);
    // });

    // host: "127.0.0.1:9738",
    //     pubkey:
    //       "020cd30d13d5011a08830d6ad2e54b4e220c7b20457c094701b09346052343f519",

    const { pubkey, host } = args;

    return this.request<any>("POST", "/v1/peers", {
      addr: {
        pubkey,
        host,
      },
      perm: true,
    })
      .then((data) => {
        console.log("DATA: ", data);

        return {
          data: {},
        };
        // if (data.payment_error) {
        //   throw new Error(data.payment_error);
        // }
        // return {
        //   data: {
        //     preimage: utils.base64ToHex(data.payment_preimage),
        //     paymentHash: utils.base64ToHex(data.payment_hash),
        //     route: data.payment_route,
        //   },
        // };
      })
      .catch((e) => {
        // the request fails (HTTP 500), but if we are already connected we say it's a success
        if (e.message.match(/already connected/)) {
          return {
            data: {},
          };
        } else {
          return {
            error: e.message,
          };
        }
      });
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
        throw new Error(data.payment_error);
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
  async keysend(args: KeysendArgs): Promise<SendPaymentResponse> {
    //See: https://gist.github.com/dellagustin/c3793308b75b6b0faf134e64db7dc915
    const dest_pubkey_hex = args.pubkey;
    const dest_pubkey_base64 = Hex.parse(dest_pubkey_hex).toString(Base64);

    const preimage = WordArray.random(32);
    const preimage_base64 = preimage.toString(Base64);
    const hash = SHA256(preimage).toString(Base64);

    //base64 encode the record values
    const records_base64: Record<string, string> = {};
    for (const key in args.customRecords) {
      records_base64[key] = UTF8.parse(args.customRecords[key]).toString(
        Base64
      );
    }
    //mandatory record for keysend
    records_base64["5482373484"] = preimage_base64;

    return this.request<{
      payment_preimage: string;
      payment_hash: string;
      payment_route: { total_amt: number; total_fees: number };
      payment_error?: string;
    }>(
      "POST",
      "/v1/channels/transactions",
      {
        dest: dest_pubkey_base64,
        amt: args.amount,
        payment_hash: hash,
        dest_custom_records: records_base64,
      },
      {}
    ).then((data) => {
      if (data.payment_error) {
        throw new Error(data.payment_error);
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
    url.pathname = `${url.pathname.replace(/\/$/, "")}${path}`;
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
      // TODO: this needs refactoring! we also should switch to using axios here
      let errBody;
      try {
        errBody = await res.json();
        // Breaking change in v0.14.1, res.error became res.message. Simply
        // map it over for now.
        if (errBody.message && !errBody.error) {
          errBody.error = errBody.message;
          delete errBody.message;
        }
        if (!errBody.error) {
          throw new Error("Something went wrong");
        }
      } catch (err) {
        throw new Error(res.statusText);
      }
      console.error(errBody);
      throw new Error(errBody.error);
    }
    let data = await res.json();
    if (defaultValues) {
      data = Object.assign(Object.assign({}, defaultValues), data);
    }
    return data;
  }
}

export default Lnd;
