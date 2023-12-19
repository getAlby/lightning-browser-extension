import { webln } from "@getalby/sdk";
import { NostrWebLNProvider } from "@getalby/sdk/dist/webln";
import { Account } from "~/types";
import Connector, {
  CheckPaymentArgs,
  CheckPaymentResponse,
  ConnectPeerArgs,
  ConnectPeerResponse,
  ConnectorTransaction,
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
      "getBalance",
      "keysend",
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
    const info = await this.nwc.getInfo();
    return {
      data: info.node,
    };
  }

  async getBalance(): Promise<GetBalanceResponse> {
    const balance = await this.nwc.getBalance();
    return {
      data: { balance: balance.balance, currency: "BTC" },
    };
  }

  async getTransactions(): Promise<GetTransactionsResponse> {
    const listTransactionsResponse = await this.nwc.listTransactions({
      unpaid: false,
      limit: 50, // restricted by relay max event payload size
    });

    const transactions: ConnectorTransaction[] =
      listTransactionsResponse.transactions.map(
        (transaction, index): ConnectorTransaction => ({
          id: `${index}`,
          memo: transaction.description,
          preimage: transaction.preimage,
          payment_hash: transaction.payment_hash,
          settled: true,
          settleDate: new Date(transaction.settled_at).getTime(),
          totalAmount: transaction.amount,
          type: transaction.type == "incoming" ? "received" : "sent",
        })
      );
    return {
      data: {
        transactions,
      },
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

  async keysend(args: KeysendArgs): Promise<SendPaymentResponse> {
    const data = await this.nwc.keysend({
      destination: args.pubkey,
      amount: args.amount,
      customRecords: args.customRecords,
    });

    return {
      data: {
        preimage: data.payment_preimage,
        paymentHash: data.payment_hash,
        route: { total_amt: data.amount, total_fees: data.fee },
      },
    };
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
