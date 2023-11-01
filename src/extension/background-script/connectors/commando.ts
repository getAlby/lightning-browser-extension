import Hex from "crypto-js/enc-hex";
import UTF8 from "crypto-js/enc-utf8";
import LnMessage from "lnmessage";
import { v4 as uuidv4 } from "uuid";
import { Account } from "~/types";

import Connector, {
  CheckPaymentArgs,
  CheckPaymentResponse,
  ConnectorInvoice,
  ConnectPeerArgs,
  ConnectPeerResponse,
  flattenRequestMethods,
  GetBalanceResponse,
  GetInfoResponse,
  GetInvoicesResponse,
  KeysendArgs,
  MakeInvoiceArgs,
  MakeInvoiceResponse,
  SendPaymentArgs,
  SendPaymentResponse,
  SignMessageArgs,
  SignMessageResponse,
} from "./connector.interface";

interface Config {
  host: string;
  port: number;
  rune: string;
  pubkey: string;
  wsProxy: string;
  privateKey: string;
}

type CommandoGetInfoResponse = {
  alias: string;
  id: string;
  color: string;
};
type CommandoSignMessageResponse = {
  zbase: string;
};
type CommandoMakeInvoiceResponse = {
  bolt11: string;
  payment_hash: string;
  payment_secret: string;
};
type CommandoChannel = {
  peer_id: string;
  channel_sat: number;
  amount_msat: number;
  funding_txid: string;
  funding_output: number;
  connected: boolean;
  state: string;
};
type CommandoListFundsResponse = {
  channels: CommandoChannel[];
};
type CommandoListInvoicesResponse = {
  invoices: CommandoInvoice[];
};
type CommandoPayInvoiceResponse = {
  payment_preimage: string;
  payment_hash: string;
  msatoshi: number;
  msatoshi_sent: number;
};
type CommandoListInvoiceResponse = {
  invoices: CommandoInvoice[];
};

type CommandoInvoice = {
  label: string;
  status: string;
  description: string;
  msatoshi: number;
  bolt11: string;
  payment_preimage: string;
  paid_at: number;
  payment_hash: string;
};

const supportedMethods: string[] = [
  "bkpr-listbalances",
  "checkmessage",
  "connect",
  "decode",
  "decodepay",
  "disconnect",
  "feerates",
  "fundchannel",
  "getinfo",
  "getroute",
  "invoice",
  "keysend",
  "listforwards",
  "listfunds",
  "listinvoices",
  "listnodes",
  "listoffers",
  "listpays",
  "listpeers",
  "listsendpays",
  "listtransactions",
  "multifundchannel",
  "offer",
  "pay",
  "sendpay",
  "setchannel",
  "signmessage",
];

export default class Commando implements Connector {
  account: Account;
  config: Config;
  ln: LnMessage;

  constructor(account: Account, config: Config) {
    this.account = account;
    this.config = config;
    this.ln = new LnMessage({
      remoteNodePublicKey: this.config.pubkey,
      wsProxy: this.config.wsProxy,
      ip: this.config.host,
      port: this.config.port || 9735,
      privateKey: this.config.privateKey,
      // logger: {
      //   info: console.log,
      //   warn: console.warn,
      //   error: console.error
      // },
    });
  }

  async init() {
    // initiate the connection to the remote node
    await this.ln.connect();
  }

  async unload() {
    await this.ln.disconnect();
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
      ...flattenRequestMethods(supportedMethods),
    ];
  }

  async requestMethod(
    method: string,
    params: Record<string, unknown>
  ): Promise<{ data: unknown }> {
    if (!this.supportedMethods.includes(method)) {
      throw new Error(`${method} is not supported`);
    }
    const response = await this.ln.commando({
      method,
      params,
      rune: this.config.rune,
    });

    return {
      data: response,
    };
  }

  async connectPeer(args: ConnectPeerArgs): Promise<ConnectPeerResponse> {
    return this.ln
      .commando({
        method: "connect",
        params: {
          id: args.pubkey,
          host: args.host,
        },
        rune: this.config.rune,
      })
      .then((resp) => {
        return {
          data: true,
        };
      });
  }

  async getInvoices(): Promise<GetInvoicesResponse> {
    return this.ln
      .commando({
        method: "listinvoices",
        params: {},
        rune: this.config.rune,
      })
      .then((resp) => {
        const parsed = resp as CommandoListInvoicesResponse;
        return {
          data: {
            invoices: parsed.invoices
              .map(
                (invoice, index): ConnectorInvoice => ({
                  id: invoice.label,
                  memo: invoice.description,
                  settled: invoice.status === "paid",
                  preimage: invoice.payment_preimage,
                  settleDate: invoice.paid_at * 1000,
                  type: "received",
                  totalAmount: (invoice.msatoshi / 1000).toString(),
                })
              )
              .filter((invoice) => invoice.settled)
              .sort((a, b) => {
                return b.settleDate - a.settleDate;
              }),
          },
        };
      });
  }

  async getInfo(): Promise<GetInfoResponse> {
    const response = (await this.ln.commando({
      method: "getinfo",
      params: {},
      rune: this.config.rune,
    })) as CommandoGetInfoResponse;
    return {
      data: {
        alias: response.alias,
        pubkey: response.id,
        color: response.color,
      },
    };
  }

  async getBalance(): Promise<GetBalanceResponse> {
    const response = (await this.ln.commando({
      method: "listfunds",
      params: {},
      rune: this.config.rune,
    })) as CommandoListFundsResponse;
    const lnBalance = response.channels.reduce(
      (balance, channel) => balance + channel.channel_sat,
      0
    );
    return {
      data: {
        balance: lnBalance,
      },
    };
  }

  async sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse> {
    return this.ln
      .commando({
        method: "pay",
        params: {
          bolt11: args.paymentRequest,
        },
        rune: this.config.rune,
      })
      .then((resp) => {
        const parsed = resp as CommandoPayInvoiceResponse;
        return {
          data: {
            paymentHash: parsed.payment_hash,
            preimage: parsed.payment_preimage,
            route: {
              total_amt: Math.floor(parsed.msatoshi_sent / 1000),
              total_fees: Math.floor(
                (parsed.msatoshi_sent - parsed.msatoshi) / 1000
              ),
            },
          },
        };
      });
  }

  async keysend(args: KeysendArgs): Promise<SendPaymentResponse> {
    //hex encode the record values
    const records_hex: Record<string, string> = {};
    for (const key in args.customRecords) {
      records_hex[key] = UTF8.parse(args.customRecords[key]).toString(Hex);
    }
    const boostagram: { [key: string]: string } = {};
    for (const key in args.customRecords) {
      boostagram[key] = UTF8.parse(args.customRecords[key]).toString(Hex);
    }
    return this.ln
      .commando({
        method: "keysend",
        params: {
          destination: args.pubkey,
          msatoshi: args.amount * 1000,
          extratlvs: boostagram,
        },
        rune: this.config.rune,
      })
      .then((resp) => {
        const parsed = resp as CommandoPayInvoiceResponse;
        return {
          data: {
            paymentHash: parsed.payment_hash,
            preimage: parsed.payment_preimage,
            route: {
              total_amt: Math.floor(parsed.msatoshi_sent / 1000),
              total_fees: Math.floor(
                (parsed.msatoshi_sent - parsed.msatoshi) / 1000
              ),
            },
          },
        };
      });
  }

  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    return this.ln
      .commando({
        method: "listinvoices",
        params: {
          payment_hash: args.paymentHash,
        },
        rune: this.config.rune,
      })
      .then((resp) => {
        const parsed = resp as CommandoListInvoiceResponse;
        return {
          data: {
            paid: parsed.invoices[0]?.status === "paid",
          },
        };
      });
  }

  signMessage(args: SignMessageArgs): Promise<SignMessageResponse> {
    return this.ln
      .commando({
        method: "signmessage",
        params: {
          message: args.message,
        },
        rune: this.config.rune,
      })
      .then((resp) => {
        const parsed = resp as CommandoSignMessageResponse;
        return {
          data: {
            message: args.message,
            signature: parsed.zbase,
          },
        };
      });
  }

  async makeInvoice(args: MakeInvoiceArgs): Promise<MakeInvoiceResponse> {
    const label = uuidv4();
    const response = (await this.ln.commando({
      method: "invoice",
      params: {
        amount_msat: (args.amount as number) * 1000,
        label: label,
        description: args.memo,
      },
      rune: this.config.rune,
    })) as CommandoMakeInvoiceResponse;
    return {
      data: {
        paymentRequest: response.bolt11,
        rHash: response.payment_hash,
      },
    };
  }
}
