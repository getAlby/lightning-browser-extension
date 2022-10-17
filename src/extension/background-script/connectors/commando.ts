import LnMessage from "lnmessage";
import { v4 as uuidv4 } from "uuid";

import Connector, {
  CheckPaymentArgs,
  CheckPaymentResponse,
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

  // not yet implemented
  connectPeer() {
    console.error(
      `${this.constructor.name} does not implement the getInvoices call`
    );
    return new Error("Not yet supported with the currently used account.");
  }

  async getInvoices(): Promise<GetInvoicesResponse> {
    throw new Error("Not yet supported with the currently used account.");
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
    throw new Error("Not yet supported with the currently used account.");
  }

  async keysend(args: KeysendArgs): Promise<SendPaymentResponse> {
    throw new Error("Not yet supported with the currently used account.");
  }

  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    throw new Error("Not yet supported with the currently used account.");
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
