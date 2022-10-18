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
  amount_msat: string;
  amount_sent_msat: string;
};
type CommandoListPayResponse = {
  pays: CommandoPay[];
};
type CommandoPay = {
  payment_hash: string;
  preimage: string;
  status: string;
};

type CommandoInvoice = {
  label: string;
  status: string;
  description: string;
  amount_received_msat: number;
  bolt11: string;
  payment_preimage: string;
  paid_at: number;
  payment_hash: string;
};
export default class Commando implements Connector {
  config: Config;
  ln: LnMessage;

  constructor(config: Config) {
    this.config = config;
    this.ln = new LnMessage({
      remoteNodePublicKey: this.config.pubkey,
      wsProxy: this.config.wsProxy || "wss://lnwsproxy.regtest.getalby.com",
      ip: this.config.host,
      port: this.config.port || 9735,
      // logger: {
      //   info: console.log,
      //   warn: console.warn,
      //   error: console.error
      // },
      privateKey:
        this.config.privateKey ||
        "d6a2eba36168cc31e97396a781a4dd46dd3648c001d3f4fde221d256e41715ea",
    });
  }

  async init() {
    // initiate the connection to the remote node
    await this.ln.connect();
  }

  unload() {
    return Promise.resolve();
  }

  async connectPeer(
    args: ConnectPeerArgs
  ): Promise<ConnectPeerResponse | Error> {
    return this.ln
      .commando({
        method: "connect",
        params: [args.pubkey, args.host],
        rune: this.config.rune,
      })
      .then((resp) => {
        return {
          data: true,
        };
      })
      .catch((err) => {
        return new Error(err);
      });
  }

  async getInvoices(): Promise<GetInvoicesResponse> {
    return this.ln
      .commando({
        method: "listinvoices",
        params: [],
        rune: this.config.rune,
      })
      .then((resp) => {
        const parsed = resp as CommandoListInvoicesResponse;
        return {
          data: {
            invoices: parsed.invoices.map(
              (invoice, index): ConnectorInvoice => ({
                id: invoice.label,
                memo: invoice.description,
                settled: invoice.status == "paid",
                preimage: invoice.payment_preimage,
                settleDate: invoice.paid_at,
                type: "received",
                totalAmount: (invoice.amount_received_msat / 1000).toString(),
              })
            ),
          },
        };
      });
  }

  async getInfo(): Promise<GetInfoResponse> {
    const response = (await this.ln.commando({
      method: "getinfo",
      params: [],
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
      params: [],
      rune: this.config.rune,
    })) as CommandoListFundsResponse;
    let lnBalance = 0;
    for (let i = 0; i < response.channels.length; i++) {
      lnBalance = lnBalance + response.channels[i].channel_sat;
    }
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
        params: [args.paymentRequest],
        rune: this.config.rune,
      })
      .then((resp) => {
        const parsed = resp as CommandoPayInvoiceResponse;
        const parsedTotalAmtStr = parsed.amount_msat.replace("msat", "");
        const parsedSentAmtPaidStr = parsed.amount_sent_msat.replace(
          "msat",
          ""
        );
        const parsedTotalAmt = (parsedTotalAmtStr as unknown as number) / 1000;
        const parsedTotalFee =
          ((parsedSentAmtPaidStr as unknown as number) -
            (parsedTotalAmtStr as unknown as number)) /
          1000;
        return {
          data: {
            paymentHash: parsed.payment_hash,
            preimage: parsed.payment_preimage,
            route: {
              total_amt: parsedTotalAmt,
              total_fees: parsedTotalFee,
            },
          },
        };
      });
  }

  async keysend(args: KeysendArgs): Promise<SendPaymentResponse> {
    throw new Error("Not yet supported with the currently used account.");
  }

  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    return this.ln
      .commando({
        method: "listpays",
        params: ["-k", "payment_hash=" + args.paymentHash],
        rune: this.config.rune,
      })
      .then((resp) => {
        const parsed = resp as CommandoListPayResponse;
        if (parsed.pays.length != 1) {
          return {
            data: {
              paid: false,
            },
          };
        }
        return {
          data: {
            paid: parsed.pays[0].status == "complete",
          },
        };
      });
  }

  signMessage(args: SignMessageArgs): Promise<SignMessageResponse> {
    throw new Error("Not yet supported with the currently used account.");
  }

  async makeInvoice(args: MakeInvoiceArgs): Promise<MakeInvoiceResponse> {
    const label = uuidv4();
    const response = (await this.ln.commando({
      method: "invoice",
      params: [(args.amount as number) * 1000, label, args.memo],
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
