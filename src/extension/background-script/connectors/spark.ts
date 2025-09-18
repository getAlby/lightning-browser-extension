import type { SparkWallet } from "@buildonspark/spark-sdk";
import type {
  LightningReceiveRequest,
  LightningSendRequest,
  WalletTransfer,
} from "@buildonspark/spark-sdk/dist/types";
import { Invoice } from "@getalby/lightning-tools";
import { decryptData } from "~/common/lib/crypto";
import state from "~/extension/background-script/state";
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
  private _wallet: SparkWallet | undefined;
  private account: Account;
  private config: Config;

  get supportedMethods() {
    return [
      "getInfo",
      "makeInvoice",
      "sendPayment",
      "sendPaymentAsync",
      "getBalance",
      "getTransactions",
      "signMessage",
    ];
  }

  constructor(account: Account, config: Config) {
    this.account = account;
    this.config = config;
  }

  async init() {
    if (!this.account.mnemonic) {
      throw new Error("Account has no mnemonic set");
    }

    const SparkWallet = await import("@buildonspark/spark-sdk").then(
      (mod) => mod.SparkWallet
    );
    const password = (await state.getState().password()) as string;
    const decryptedMnemonic = await decryptData(
      this.account.mnemonic,
      password
    );

    const { wallet } = await SparkWallet.initialize({
      mnemonicOrSeed: decryptedMnemonic,
      options: {
        network: "MAINNET",
      },
    });
    this._wallet = wallet;
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
    if (!this._wallet) {
      throw new Error("Wallet not initialized");
    }

    const transfers: WalletTransfer[] = [];
    let offset = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { transfers: tr } = await this._wallet.getTransfers(100, offset);
      if (tr.length === 0) {
        break;
      }
      transfers.push(...tr);
      offset += 100;
    }

    return {
      data: {
        transactions: transfers.map((transfer) => {
          let preimage: string | undefined;
          let paymentHash: string | undefined;
          let memo: string | undefined;
          let fee = 0;
          let amount = 0;
          if (transfer.userRequest?.typename === "LightningSendRequest") {
            preimage = (transfer.userRequest as LightningSendRequest)
              .paymentPreimage;
            fee = (transfer.userRequest as LightningSendRequest).fee
              .originalValue;
            const encodedInvoice = (
              transfer.userRequest as LightningSendRequest
            ).encodedInvoice;
            const invoice = new Invoice({ pr: encodedInvoice });
            paymentHash = invoice.paymentHash;
            memo = invoice.description || undefined;
            amount = invoice.satoshi;
          }
          if (transfer.userRequest?.typename === "LightningReceiveRequest") {
            preimage = (transfer.userRequest as LightningReceiveRequest)
              .paymentPreimage;

            const encodedInvoice = (
              transfer.userRequest as LightningReceiveRequest
            ).invoice.encodedInvoice;
            const invoice = new Invoice({ pr: encodedInvoice });
            paymentHash = invoice.paymentHash;
            memo = invoice.description || undefined;
            amount = invoice.satoshi;
          }
          return {
            id: transfer.id,
            memo,
            preimage: preimage || "",
            payment_hash: paymentHash,
            settled: transfer.status === "TRANSFER_STATUS_COMPLETED",
            settleDate:
              (transfer.status === "TRANSFER_STATUS_COMPLETED"
                ? transfer.updatedTime?.getTime()
                : undefined) || null,
            creationDate:
              transfer.createdTime?.getTime() || new Date().getTime(),
            totalAmount: amount,
            fee,
            //displayAmount?: [number, ACCOUNT_CURRENCIES];
            type:
              transfer.transferDirection === "OUTGOING" ? "sent" : "received",
            state:
              transfer.status === "TRANSFER_STATUS_COMPLETED"
                ? "settled"
                : transfer.status === "TRANSFER_STATUS_SENDER_INITIATED"
                ? "pending"
                : "failed",
            //metadata?: Nip47TransactionMetadata;
          };
        }),
      },
    };
  }

  async makeInvoice(args: MakeInvoiceArgs): Promise<MakeInvoiceResponse> {
    if (!this._wallet) {
      throw new Error("Wallet not initialized");
    }

    if (!globalThis.crypto.getRandomValues) {
      throw new Error("No Crypto getRandomValues");
    }

    const receiveRequest = await this._wallet.createLightningInvoice({
      amountSats: +args.amount,
      memo: args.memo,
    });

    return {
      data: {
        paymentRequest: receiveRequest.invoice.encodedInvoice,
        rHash: receiveRequest.invoice.paymentHash,
      },
    };
  }

  async sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse> {
    if (!this._wallet) {
      throw new Error("Wallet not initialized");
    }
    const invoice = new Invoice({ pr: args.paymentRequest });

    const sendRequest = await this._wallet.payLightningInvoice({
      invoice: args.paymentRequest,
      // TODO: calculate the fee first
      maxFeeSats: 10 + Math.floor((invoice.satoshi || 0) * 0.01),
    });

    for (let i = 0; i < 10; i++) {
      const updatedSendRequest = await this._wallet.getLightningSendRequest(
        sendRequest.id
      );
      if (updatedSendRequest?.paymentPreimage) {
        return {
          data: {
            preimage: updatedSendRequest.paymentPreimage,
            paymentHash: invoice.paymentHash,
            route: {
              total_amt: invoice.satoshi,
              total_fees: Math.floor(
                updatedSendRequest.fee.originalValue / 1000
              ), // msat
            },
          },
        };
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // TODO: add better handling
    throw new Error("Payment failed or timed out");
  }

  async keysend(args: KeysendArgs): Promise<SendPaymentResponse> {
    throw new Error("Method not implemented.");
  }

  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    if (!this._wallet) {
      throw new Error("Wallet not initialized");
    }
    try {
      // HACK: get transactions to find received payment
      // ideally we can look up a payment by payment hash, not just a spark transfer ID
      // (currently we do not store transfers locally)
      const transactions = await this.getTransactions();

      const transaction = transactions.data.transactions.find(
        (t) => t.payment_hash === args.paymentHash
      );

      return {
        data: {
          paid: !!transaction?.preimage,
          preimage: transaction?.preimage,
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
    if (!this._wallet) {
      throw new Error("Wallet not initialized");
    }
    const signature = await this._wallet.signMessageWithIdentityKey(
      args.message
    );

    return {
      data: {
        message: args.message,
        signature: signature,
      },
    };
  }

  connectPeer(args: ConnectPeerArgs): Promise<ConnectPeerResponse> {
    throw new Error("Method not implemented.");
  }
}

export default SparkConnector;
