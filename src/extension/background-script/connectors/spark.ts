import { SparkWallet } from "@buildonspark/spark-sdk";
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

class SparkConnector implements Connector {
  config: Config;
  private _wallet: SparkWallet | undefined;

  get supportedMethods() {
    return [
      "getInfo",
      "makeInvoice",
      "sendPayment",
      "sendPaymentAsync",
      "getBalance",
      "getTransactions",
      // "signMessage",
    ];
  }

  constructor(account: Account, config: Config) {
    this.config = config;
  }

  async init() {
    // TODO: use the master key
    const mnemonic = "TODO put your mnmemonic here";

    const { wallet } = await SparkWallet.initialize({
      mnemonicOrSeed: mnemonic,
      options: {
        network: "REGTEST",
      },
    });
    this._wallet = wallet;

    return Promise.resolve();
  }

  async unload() {}

  async getInfo(): Promise<GetInfoResponse> {
    return {
      data: {
        alias: "Spark",
      },
    };
  }

  async getBalance(): Promise<GetBalanceResponse> {
    if (!this._wallet) {
      throw new Error("Wallet not initialized");
    }
    const balance = await this._wallet.getBalance();
    return {
      data: { balance: Number(balance.balance), currency: "BTC" },
    };
  }

  async getTransactions(): Promise<GetTransactionsResponse> {
    return {
      data: {
        transactions: [],
      },
    };
  }

  async makeInvoice(args: MakeInvoiceArgs): Promise<MakeInvoiceResponse> {
    throw new Error("Method not implemented.");
    /*
    return {
      data: {
        paymentRequest: invoice.invoice,
        rHash: invoice.payment_hash,
      },
    };*/
  }

  async sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse> {
    throw new Error("Method not implemented.");
    /*const invoice = lightningPayReq.decode(args.paymentRequest);
    const paymentHash = invoice.tags.find(
      (tag) => tag.tagName === "payment_hash"
    )?.data as string | undefined;
    if (!paymentHash) {
      throw new Error("Could not find payment hash in invoice");
    }

    const response = await this.nwc.payInvoice({
      invoice: args.paymentRequest,
    });

    return {
      data: {
        preimage: response.preimage,
        paymentHash,
        route: {
          // TODO: how to get amount paid for zero-amount invoices?
          total_amt: Math.floor(parseInt(invoice.millisatoshis || "0") / 1000),
          // TODO: How to get fees?
          total_fees: 0,
        },
      },
    };*/
  }

  async keysend(args: KeysendArgs): Promise<SendPaymentResponse> {
    throw new Error("Method not implemented.");
  }

  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    throw new Error("Method not implemented.");
  }

  async signMessage(args: SignMessageArgs): Promise<SignMessageResponse> {
    throw new Error("Method not implemented.");
  }

  connectPeer(args: ConnectPeerArgs): Promise<ConnectPeerResponse> {
    throw new Error("Method not implemented.");
  }
}

export default SparkConnector;
