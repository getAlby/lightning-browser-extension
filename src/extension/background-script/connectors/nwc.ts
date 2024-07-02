import { nwc } from "@getalby/sdk";
import lightningPayReq from "bolt11-signet";
import Hex from "crypto-js/enc-hex";
import SHA256 from "crypto-js/sha256";
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

interface TlvRecord {
  type: number;
  value: string;
}

class NWCConnector implements Connector {
  config: Config;
  nwc: nwc.NWCClient;

  get supportedMethods() {
    return [
      "getInfo",
      "makeInvoice",
      "sendPayment",
      "sendPaymentAsync",
      "getBalance",
      "keysend",
      "getTransactions",
      "signMessage",
    ];
  }

  constructor(account: Account, config: Config) {
    this.config = config;
    this.nwc = new nwc.NWCClient({
      nostrWalletConnectUrl: this.config.nostrWalletConnectUrl,
    });
  }

  async init() {
    return Promise.resolve();
  }

  async unload() {
    this.nwc.close();
  }

  async getInfo(): Promise<GetInfoResponse> {
    const info = await this.nwc.getInfo();
    return {
      data: info,
    };
  }

  async getBalance(): Promise<GetBalanceResponse> {
    const balance = await this.nwc.getBalance();
    return {
      data: { balance: balance.balance / 1000, currency: "BTC" },
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
          settleDate: transaction.settled_at * 1000,
          totalAmount: transaction.amount / 1000,
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
      amount:
        typeof args.amount === "number"
          ? args.amount * 1000
          : parseInt(args.amount) * 1000 || 0,
      description: args.memo,
    });

    return {
      data: {
        paymentRequest: invoice.invoice,
        rHash: invoice.payment_hash,
      },
    };
  }

  async sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse> {
    const invoice = lightningPayReq.decode(args.paymentRequest);
    const paymentHash = invoice.tags.find(
      (tag) => tag.tagName === "payment_hash"
    )?.data as string | undefined;
    if (!paymentHash) {
      throw new Error("Could not find payment hash in invoice");
    }

    const response = await this.nwc.payInvoice({
      invoice: args.paymentRequest,
    });

    const transaction = await this.nwc.lookupInvoice({
      invoice: args.paymentRequest,
    });

    return {
      data: {
        preimage: response.preimage,
        paymentHash,
        route: {
          // TODO: how to get amount paid for zero-amount invoices?
          total_amt: parseInt(invoice.millisatoshis || "0") / 1000,
          total_fees: transaction.fees_paid / 1000,
        },
      },
    };
  }

  async keysend(args: KeysendArgs): Promise<SendPaymentResponse> {
    const data = await this.nwc.payKeysend({
      pubkey: args.pubkey,
      amount: args.amount * 1000,
      tlv_records: this.convertCustomRecords(args.customRecords),
    });

    const paymentHash = SHA256(data.preimage).toString(Hex);

    const transaction = await this.nwc.lookupInvoice({
      payment_hash: paymentHash,
    });

    return {
      data: {
        preimage: data.preimage,
        paymentHash,

        route: {
          total_amt: args.amount,
          total_fees: transaction.fees_paid / 1000,
        },
      },
    };
  }

  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    try {
      const response = await this.nwc.lookupInvoice({
        payment_hash: args.paymentHash,
      });

      return {
        data: {
          paid: !!response.settled_at,
          preimage: response.preimage,
        },
      };
    } catch (error) {
      console.error(error);
      return {
        data: {
          paid: false,
        },
      };
    }
  }

  async signMessage(args: SignMessageArgs): Promise<SignMessageResponse> {
    const response = await this.nwc.signMessage({ message: args.message });

    return Promise.resolve({
      data: {
        message: response.message,
        signature: response.signature,
      },
    });
  }

  connectPeer(args: ConnectPeerArgs): Promise<ConnectPeerResponse> {
    throw new Error("Method not implemented.");
  }

  private convertCustomRecords(
    customRecords: Record<string, string>
  ): TlvRecord[] {
    return Object.entries(customRecords).map(([key, value]) => ({
      type: parseInt(key),
      value: value,
    }));
  }
}

export default NWCConnector;
