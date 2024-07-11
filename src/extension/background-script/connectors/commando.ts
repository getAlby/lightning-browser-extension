import Hex from "crypto-js/enc-hex";
import UTF8 from "crypto-js/enc-utf8";
import LnMessage from "lnmessage";
import { v4 as uuidv4 } from "uuid";
import { Account } from "~/types";

import { mergeTransactions } from "~/common/utils/helpers";
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
  peer_id?: string;
  funding_txid?: string;
  funding_output?: string;
  connected?: boolean;
  state?: string;
  short_channel_id?: string;
  our_amount_msat?: number;
  channel_sat?: number;
  channel_total_sat?: number;
  amount_msat?: number;
};
type CommandoListFundsResponse = {
  channels: CommandoChannel[];
};
type CommandoListInvoicesResponse = {
  invoices: CommandoInvoice[];
};

type CommandoListSendPaysResponse = {
  payments: CommandoPayment[];
};

type CommandoPayInvoiceResponse = {
  payment_preimage: string;
  payment_hash: string;
  created_at: number;
  parts: string;
  amount_msat: number;
  amount_sent_msat: number;
  status: string;
  destination?: string;
};

type CommandoListInvoiceResponse = {
  invoices: CommandoInvoice[];
};

type CommandoInvoice = {
  label: string;
  payment_hash: string;
  status: string;
  expires_at: number;
  description?: string;
  amount_msat?: number;
  bolt11?: string;
  bolt12?: string;
  local_offer_id?: number;
  invreq_payer_note?: string;
  pay_index: number;
  amount_received_msat: number;
  payment_preimage: string;
  paid_at: number;
};

type CommandoPayment = {
  id: number;
  partid?: number;
  groupid: number;
  created_at: number;
  label?: string;
  status: string;
  description?: string;
  amount_sent_msat: number;
  amount_msat?: number;
  bolt11?: string;
  bolt12?: string;
  payment_preimage: string;
  payment_hash: string;
  destination: string;
  erroronion?: string;
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

  private async getInvoices(): Promise<ConnectorTransaction[]> {
    return this.ln
      .commando({
        method: "listinvoices",
        params: {},
        rune: this.config.rune,
      })
      .then((resp) => {
        const parsed = resp as CommandoListInvoicesResponse;
        return parsed.invoices
          .map(
            (invoice, index): ConnectorTransaction => ({
              id: invoice.label,
              memo: invoice.description,
              settled: invoice.status === "paid",
              preimage: invoice.payment_preimage,
              payment_hash: invoice.payment_hash,
              settleDate: invoice.paid_at * 1000,
              type: "received",
              totalAmount: Math.floor(invoice.amount_received_msat / 1000),
            })
          )
          .filter((invoice) => invoice.settled);
      });
  }

  async getTransactions(): Promise<GetTransactionsResponse> {
    const incomingInvoicesResponse = await this.getInvoices();
    const outgoingInvoicesResponse = await this.getPayments();

    const transactions: ConnectorTransaction[] = mergeTransactions(
      incomingInvoicesResponse,
      outgoingInvoicesResponse
    );

    return {
      data: {
        transactions,
      },
    };
  }

  private async getPayments(): Promise<ConnectorTransaction[]> {
    return await this.ln
      .commando({
        method: "listsendpays",
        params: {},
        rune: this.config.rune,
      })
      .then((resp) => {
        const parsed = resp as CommandoListSendPaysResponse;
        return parsed.payments
          .map(
            (payment, index): ConnectorTransaction => ({
              id: `${payment.id}`,
              memo: payment.description ?? "",
              settled: payment.status === "complete",
              preimage: payment.payment_preimage,
              payment_hash: payment.payment_hash,
              settleDate: payment.created_at * 1000,
              type: "sent",
              totalAmount: payment.amount_sent_msat / 1000,
            })
          )
          .filter((payment) => payment.settled);
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
    // https://github.com/ElementsProject/cln-application/blob/main/apps/frontend/src/store/AppContext.tsx#L139
    const lnBalance = response.channels
      .filter((x) => x.connected && x.state == "CHANNELD_NORMAL")
      .reduce(
        (balance, channel) =>
          balance +
          Math.floor(
            channel.channel_sat || (channel.our_amount_msat || 0) / 1000
          ),
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
              total_amt: Math.floor(parsed.amount_msat / 1000),
              total_fees: Math.floor(
                (parsed.amount_sent_msat - parsed.amount_msat) / 1000
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
              total_amt: Math.floor(parsed.amount_msat / 1000),
              total_fees: Math.floor(
                (parsed.amount_sent_msat - parsed.amount_msat) / 1000
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
