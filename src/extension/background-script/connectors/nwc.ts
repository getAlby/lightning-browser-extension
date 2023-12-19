import { webln } from "@getalby/sdk";
import { NostrWebLNProvider } from "@getalby/sdk/dist/webln";
import { Account } from "~/types";
import Connector, {
  CheckPaymentArgs,
  CheckPaymentResponse,
  ConnectPeerArgs,
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
  nostrWalletConnectUrl: string;
}

class NWCConnector implements Connector {
  config: Config;
  nwc: NostrWebLNProvider;

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

  constructor(account: Account, config: Config) {
    this.config = config;
    this.nwc = new webln.NostrWebLNProvider({
      nostrWalletConnectUrl: this.config.nostrWalletConnectUrl,
    });
  }

  async init() {
    return this.nwc.enable();
  }

  async unload() {
    this.nwc.close();
  }

  async getInfo(): Promise<GetInfoResponse> {
    // TODO: Load via NWC
    return {
      data: { alias: "NWC" },
    };
  }

  async getBalance(): Promise<GetBalanceResponse> {
    const balance = await this.nwc.getBalance();
    return {
      data: { balance: balance.balance, currency: "BTC" },
    };
  }

  async getTransactions(): Promise<GetTransactionsResponse> {
    // TODO: Load via NWC
    return {
      data: { transactions: [] },
    };
  }

  async makeInvoice(args: MakeInvoiceArgs): Promise<MakeInvoiceResponse> {
    const invoice = await this.nwc.makeInvoice({
      amount: args.amount,
      defaultMemo: args.memo,
    });

    return {
      data: {
        paymentRequest: invoice.paymentRequest,
        // TODO: payment hash is missing in the make_invoice response?
        rHash: "",
      },
    };
  }

  async sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse> {
    const response = await this.nwc.sendPayment(args.paymentRequest);
    return {
      data: {
        preimage: response.preimage,
        paymentHash: response.paymentHash,
        // TODO: How to get fees via NWC?
        route: { total_amt: 1, total_fees: 1 },
      },
    };
  }

  keysend(args: KeysendArgs): Promise<SendPaymentResponse> {
    throw new Error("Method not implemented.");
  }

  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    const invoice = await this.nwc.lookupInvoice({
      payment_hash: args.paymentHash,
    });

    return invoice.paid;
  }

  signMessage(args: SignMessageArgs): Promise<SignMessageResponse> {
    throw new Error("Method not implemented.");
  }

  connectPeer(args: ConnectPeerArgs): Promise<ConnectPeerResponse> {
    throw new Error("Method not implemented.");
  }
}

export default NWCConnector;
