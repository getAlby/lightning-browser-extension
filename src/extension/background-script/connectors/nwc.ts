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
  connectionString: string;
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
      nostrWalletConnectUrl: this.config.connectionString,
    });
  }

  async init() {
    await this.nwc.enable();
  }

  async unload() {}

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

  makeInvoice(args: MakeInvoiceArgs): Promise<MakeInvoiceResponse> {
    throw new Error("Method not implemented.");
  }

  sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse> {
    throw new Error("Method not implemented.");
  }

  keysend(args: KeysendArgs): Promise<SendPaymentResponse> {
    throw new Error("Method not implemented.");
  }

  checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    throw new Error("Method not implemented.");
  }

  signMessage(args: SignMessageArgs): Promise<SignMessageResponse> {
    throw new Error("Method not implemented.");
  }

  connectPeer(args: ConnectPeerArgs): Promise<ConnectPeerResponse> {
    throw new Error("Method not implemented.");
  }
}

export default NWCConnector;
