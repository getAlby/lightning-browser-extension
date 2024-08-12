import Base64 from "crypto-js/enc-base64";
import Hex from "crypto-js/enc-hex";
import UTF8 from "crypto-js/enc-utf8";
import WordArray from "crypto-js/lib-typedarrays";
import SHA256 from "crypto-js/sha256";
import utils from "~/common/lib/utils";
import { Account } from "~/types";

import { mergeTransactions } from "~/common/utils/helpers";
import { getPaymentRequestDescription } from "~/common/utils/paymentRequest";
import Connector, {
  CheckPaymentArgs,
  CheckPaymentResponse,
  ConnectorTransaction,
  ConnectPeerArgs,
  ConnectPeerResponse,
  flattenRequestMethods,
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
  macaroon: string;
  url: string;
}

const methods: Record<string, Record<string, string>> = {
  getinfo: {
    path: "/v1/getinfo",
    httpMethod: "GET",
  },
  listchannels: {
    path: "/v1/channels",
    httpMethod: "GET",
  },
  listinvoices: {
    path: "/v1/invoices",
    httpMethod: "GET",
  },
  channelbalance: {
    path: "/v1/balance/channels",
    httpMethod: "GET",
  },
  walletbalance: {
    path: "/v1/balance/blockchain",
    httpMethod: "GET",
  },
  openchannel: {
    path: "/v1/channels",
    httpMethod: "POST",
  },
  connectpeer: {
    path: "/v1/peers",
    httpMethod: "POST",
  },
  disconnectpeer: {
    path: "/v1/peers/{{pub_key}}",
    httpMethod: "DELETE",
  },
  estimatefee: {
    path: "/v1/transactions/fee",
    httpMethod: "GET",
  },
  getchaninfo: {
    path: "/v1/graph/edge/{{chan_id}}",
    httpMethod: "GET",
  },
  getnetworkinfo: {
    path: "/v1/graph/info",
    httpMethod: "GET",
  },
  getnodeinfo: {
    path: "/v1/graph/node/{{pub_key}}",
    httpMethod: "GET",
  },
  gettransactions: {
    path: "/v1/transactions",
    httpMethod: "GET",
  },
  listpayments: {
    path: "/v1/payments",
    httpMethod: "GET",
  },
  listpeers: {
    path: "/v1/peers",
    httpMethod: "GET",
  },
  lookupinvoice: {
    path: "/v1/invoice/{{r_hash_str}}",
    httpMethod: "GET",
  },
  queryroutes: {
    path: "/v1/graph/routes/{{pub_key}}/{{amt}}",
    httpMethod: "GET",
  },
  verifymessage: {
    path: "/v1/verifymessage",
    httpMethod: "POST",
  },
  sendtoroute: {
    path: "/v1/channels/transactions/route",
    httpMethod: "POST",
  },
  decodepayreq: {
    path: "/v1/payreq/{{pay_req}}",
    httpMethod: "GET",
  },
  routermc: {
    path: "/v2/router/mc",
    httpMethod: "GET",
  },
  addinvoice: {
    path: "/v1/invoices",
    httpMethod: "POST",
  },
  addholdinvoice: {
    path: "/v2/invoices/hodl",
    httpMethod: "POST",
  },
  settleinvoice: {
    path: "/v2/invoices/settle",
    httpMethod: "POST",
  },
  newaddress: {
    path: "/v1/newaddress",
    httpMethod: "GET",
  },
  nextaddr: {
    path: "/v2/wallet/address/next",
    httpMethod: "POST",
  },
  listaddresses: {
    path: "/v2/wallet/addresses",
    httpMethod: "GET",
  },
  listunspent: {
    path: "/v2/wallet/utxos",
    httpMethod: "POST",
  },
};

const pathTemplateParser = (
  template: string,
  data: Record<string, unknown>
): string => {
  return template.replace(/{{(.*?)}}/g, (match) => {
    const key = match.split(/{{|}}/).filter(Boolean)[0];
    const value = data[key];
    if (value === undefined) {
      throw new Error(`Missing parameter ${key}`);
    }
    delete data[key];
    return String(value); // typecast to string
  });
};

class Lnd implements Connector {
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
      ...flattenRequestMethods(Object.keys(methods)),
    ];
  }

  async requestMethod(
    method: string,
    args: Record<string, unknown>
  ): Promise<{ data: unknown }> {
    const methodDetails = methods[method];
    if (!methodDetails) {
      throw new Error(`${method} is not supported`);
    }
    const httpMethod = methodDetails.httpMethod;
    let path = methodDetails.path;
    // add path parameters from the args hash and remove those attributes from args
    // e.g. pathTemplateParser('invoice/{{r_hash_str}}', {r_hash_str: 'foo'})
    //   will return invoice/foo and delete r_hash_str from the args object;
    path = pathTemplateParser(path, args);
    const response = await this.request(httpMethod, path, args);

    return {
      data: response,
    };
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

  connectPeer(args: ConnectPeerArgs): Promise<ConnectPeerResponse> {
    const { pubkey, host } = args;

    return this.request<Record<string, never>>("POST", "/v1/peers", {
      addr: {
        pubkey,
        host,
      },
      perm: true,
    })
      .then((data) => {
        return {
          data: true,
        };
      })
      .catch((e) => {
        // the request fails (HTTP 500), but if we are already connected we say it's a success
        if (e.message.match(/already connected/)) {
          return {
            data: true,
          };
        } else {
          throw new Error(e.message);
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
      const { total_amt, total_fees } = data.payment_route;
      return {
        data: {
          preimage: utils.base64ToHex(data.payment_preimage),
          paymentHash: utils.base64ToHex(data.payment_hash),
          route: { total_amt: total_amt - total_fees, total_fees },
        },
      };
    });
  }

  async keysend(args: KeysendArgs): Promise<SendPaymentResponse> {
    // See: https://gist.github.com/dellagustin/c3793308b75b6b0faf134e64db7dc915
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
    return this.request<{ balance: string }>(
      "GET",
      "/v1/balance/channels",
      undefined,
      {
        balance: 0,
      }
    ).then((data) => {
      return {
        data: {
          balance: +data.balance,
        },
      };
    });
  };

  private async getInvoices(): Promise<ConnectorTransaction[]> {
    const lndInvoices = await this.request<{
      invoices: {
        add_index: string;
        amt_paid_msat: string;
        amt_paid_sat: string;
        amt_paid: string;
        cltv_expiry: string;
        creation_date: string;
        description_hash?: string;
        expiry: string;
        fallback_addr: string;
        features: unknown[];
        htlcs: {
          chan_id: string;
          htlc_index: string;
          amt_msat: string;
          accept_height: number;
          accept_time: string;
          resolve_time: string;
          expiry_height: number;
          state: "SETTLED";
          custom_records: ConnectorTransaction["custom_records"];
          mpp_total_amt_msat: string;
          amp?: unknown;
        }[];
        is_keysend: boolean;
        memo: string;
        payment_addr: string;
        payment_request: string;
        private: boolean;
        r_hash: string;
        r_preimage: string;
        route_hints: [];
        settle_date: string;
        settle_index: string;
        settled: boolean;
        state: string;
        value_msat: string;
        value: string;
      }[];
      last_index_offset: string;
      first_index_offset: string;
    }>("GET", "/v1/invoices", { reversed: true });

    const invoices: ConnectorTransaction[] = lndInvoices.invoices.map(
      (invoice, index): ConnectorTransaction => {
        const custom_records =
          invoice.htlcs[0] && invoice.htlcs[0].custom_records;

        return {
          id: `${invoice.payment_request}-${index}`,
          memo: invoice.memo,
          preimage: utils.base64ToHex(invoice.r_preimage),
          payment_hash: utils.base64ToHex(invoice.r_hash),
          settled: invoice.settled,
          settleDate: parseInt(invoice.settle_date) * 1000,
          totalAmount: parseInt(invoice.value),
          type: "received",
          custom_records,
        };
      }
    );

    return invoices;
  }

  async getTransactions(): Promise<GetTransactionsResponse> {
    const invoices = await this.getInvoices();
    const payments = await this.getPayments();

    const transactions: ConnectorTransaction[] = mergeTransactions(
      invoices,
      payments
    );

    return {
      data: {
        transactions,
      },
    };
  }

  private async getPayments(): Promise<ConnectorTransaction[]> {
    const lndPayments = await this.request<{
      payments: {
        payment_hash: string;
        payment_preimage: string;
        value_sat: number;
        value_msat: number;
        payment_request: string;
        status: string;
        fee_sat: string;
        fee_msat: string;
        creation_time_ns: string;
        creation_date: string;
        htlcs: Array<string>;
        payment_index: string;
        failure_reason: string;
      }[];
      last_index_offset: string;
      first_index_offset: string;
      total_num_payments: string;
    }>("GET", "/v1/payments", {
      reversed: true,
      max_payments: 100,
      include_incomplete: false,
    });

    const payments: ConnectorTransaction[] = lndPayments.payments.map(
      (payment, index): ConnectorTransaction => {
        let description: string | undefined;
        if (payment.payment_request) {
          description = getPaymentRequestDescription(payment.payment_request);
        }

        return {
          id: `${payment.payment_request}-${index++}`,
          memo: description,
          preimage: payment.payment_preimage,
          payment_hash: payment.payment_hash,
          settled: true,
          settleDate: parseInt(payment.creation_date) * 1000,
          totalAmount: payment.value_sat,
          type: "sent",
        };
      }
    );

    return payments;
  }

  protected async request<Type>(
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
