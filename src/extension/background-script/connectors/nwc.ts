import { webln } from "@getalby/sdk";
import { NostrWebLNProvider } from "@getalby/sdk/dist/webln";
import lightningPayReq from "bolt11-signet";
import Base64 from "crypto-js/enc-base64";
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

type TLVRecord = {
  type: number;
  /**
   * hex-encoded value
   */
  value: string;
};

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
      "getTransactions",
      "signMessage",
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
          settleDate: transaction.settled_at * 1000,
          totalAmount: transaction.amount,
          type: transaction.type == "incoming" ? "received" : "sent",
          custom_records: mapTLVRecords(
            transaction.metadata?.["tlv_records"] as TLVRecord[] | undefined
          ),
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

    const decodedInvoice = lightningPayReq.decode(invoice.paymentRequest);
    const paymentHash = decodedInvoice.tags.find(
      (tag) => tag.tagName === "payment_hash"
    )?.data as string | undefined;
    if (!paymentHash) {
      throw new Error("Could not find payment hash in invoice");
    }

    return {
      data: {
        paymentRequest: invoice.paymentRequest,
        rHash: paymentHash,
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

    const response = await this.nwc.sendPayment(args.paymentRequest);
    return {
      data: {
        preimage: response.preimage,
        paymentHash,
        route: {
          // TODO: how to get amount paid for zero-amount invoices?
          total_amt: parseInt(invoice.millisatoshis || "0") / 1000,
          // TODO: How to get fees from WebLN?
          total_fees: 0,
        },
      },
    };
  }

  async keysend(args: KeysendArgs): Promise<SendPaymentResponse> {
    const data = await this.nwc.keysend({
      destination: args.pubkey,
      amount: args.amount,
      customRecords: args.customRecords,
    });

    const paymentHash = SHA256(data.preimage).toString(Hex);

    return {
      data: {
        preimage: data.preimage,
        paymentHash,

        route: {
          total_amt: args.amount,
          // TODO: How to get fees from WebLN?
          total_fees: 0,
        },
      },
    };
  }

  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    try {
      const response = await this.nwc.lookupInvoice({
        paymentHash: args.paymentHash,
      });

      return {
        data: {
          paid: response.paid,
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
    const response = await this.nwc.signMessage(args.message);

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
}

function mapTLVRecords(
  tlvRecords: TLVRecord[] | undefined
): ConnectorTransaction["custom_records"] | undefined {
  if (!tlvRecords) {
    return undefined;
  }
  const customRecords: ConnectorTransaction["custom_records"] = {};
  for (const tlv of tlvRecords) {
    // TODO: ConnectorTransaction["custom_records"] should not be in base64 format
    // as this requires unnecessary re-encoding
    customRecords[tlv.type.toString()] = Hex.parse(tlv.value).toString(Base64);
  }
  return customRecords;
}

export default NWCConnector;
