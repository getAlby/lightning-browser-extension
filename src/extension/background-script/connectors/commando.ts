import Hex from "crypto-js/enc-hex";
import UTF8 from "crypto-js/enc-utf8";
import LnMessage from "lnmessage";
import { v4 as uuidv4 } from "uuid";

import Connector, {
  CheckPaymentArgs,
  CheckPaymentResponse,
  ConnectorInvoice,
  ConnectPeerArgs,
  ConnectPeerResponse,
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

const methods: Record<string, string> = {
  "bkpr-listbalances": "list of all current and historical account balances",
  checkmessage: "verify that the signature was generated by a given node",
  connect: "establish a new connection with another node ",
  decode: "decode a bolt11/bolt12/rune string",
  decodepay: "check and parse a bolt11 string",
  disconnect: "close an existing connection to a peer",
  feerates: "return the feerates that CLN will use",
  fundchannel:
    "open a payment channel with a peer by committing a funding transaction",
  getinfo: "get the summary of the node",
  getroute: "find the best route for the payment to a lightning node",
  invoice: "create the expectation of a payment",
  keysend: "send a payment to another node",
  listforwards: "list all htlcs that have been attempted to be forwarded",
  listfunds: "list all funds available",
  listinvoices: "get the status of all invoices",
  listnodes: "list nodes the node has learned about via gossip messages",
  listoffers: "list all offers or get a specific offer",
  listpays: "gets the status of all pay commands",
  listpeers:
    "list nodes that are connected or have open channels with this node",
  listsendpays: "gets the status of all sendpay commands",
  listtransactions: "list transactions tracked in the wallet",
  multifundchannel:
    "open multiple payment channels with nodes by committing a single funding transaction",
  offer: "create an offer",
  pay: "send a payment to a BOLT11 invoice",
  sendpay: "send a payment via a route",
  setchannel: "configure fees / htlc range advertized for a channel",
  signmessage: "create a signature from this node",
};

export default class Commando implements Connector {
  config: Config;
  ln: LnMessage;

  constructor(config: Config) {
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
    return Object.keys(methods);
  }

  methodDescription(method: string) {
    return methods[method];
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
