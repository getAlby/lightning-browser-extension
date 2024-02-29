import LNC from "@lightninglabs/lnc-web";
import lightningPayReq from "bolt11";
import Base64 from "crypto-js/enc-base64";
import Hex from "crypto-js/enc-hex";
import UTF8 from "crypto-js/enc-utf8";
import WordArray from "crypto-js/lib-typedarrays";
import SHA256 from "crypto-js/sha256";
import snakeCase from "lodash.snakecase";
import { encryptData } from "~/common/lib/crypto";
import utils from "~/common/lib/utils";
import { Account } from "~/types";

import { mergeTransactions } from "~/common/utils/helpers";
import state from "../state";
import Connector, {
  CheckPaymentArgs,
  CheckPaymentResponse,
  ConnectorTransaction,
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
  pairingPhrase: string;
  localKey?: string;
  remoteKey?: string;
  serverHost?: string;
}

const methods: Record<string, string> = {
  addinvoice: "lnd.lightning.AddInvoice",
  addholdinvoice: "lnd.invoices.AddHoldInvoice",
  settleinvoice: "lnd.invoices.SettleInvoice",
  channelbalance: "lnd.lightning.ChannelBalance",
  connectpeer: "lnd.lightning.ConnectPeer",
  decodepayreq: "lnd.lightning.DecodePayReq",
  disconnectpeer: "lnd.lightning.DisconnectPeer",
  estimatefee: "lnd.lightning.EstimateFee",
  getchaninfo: "lnd.lightning.GetChanInfo",
  getinfo: "lnd.lightning.GetInfo",
  getnetworkinfo: "lnd.lightning.GetNetworkInfo",
  getnodeinfo: "lnd.lightning.GetNodeInfo",
  gettransactions: "lnd.lightning.GetTransactions",
  listchannels: "lnd.lightning.ListChannels",
  listinvoices: "lnd.lightning.ListInvoices",
  listpayments: "lnd.lightning.ListPayments",
  listpeers: "lnd.lightning.ListPeers",
  lookupinvoice: "lnd.lightning.LookupInvoice",
  openchannel: "lnd.lightning.OpenChannelSync",
  queryroutes: "lnd.lightning.QueryRoutes",
  routermc: "lnd.router.QueryMissionControl",
  sendtoroute: "lnd.lightning.SendToRouteSync",
  verifymessage: "lnd.lightning.VerifyMessage",
  walletbalance: "lnd.lightning.WalletBalance",
  newaddress: "lnd.lightning.NewAddress",
  nextaddr: "lnd.walletKit.nextAddr",
  listaddresses: "lnd.walletKit.ListAddresses",
  listunspent: "lnd.walletKit.ListUnspent",
};

const DEFAULT_SERVER_HOST = "mailbox.terminal.lightning.today:443";

const snakeCaseObjectDeep = (value: FixMe): FixMe => {
  if (Array.isArray(value)) {
    return value.map(snakeCaseObjectDeep);
  }

  if (value && typeof value === "object" && value.constructor === Object) {
    const obj = {} as FixMe;
    const keys = Object.keys(value);
    const len = keys.length;

    for (let i = 0; i < len; i += 1) {
      obj[snakeCase(keys[i])] = snakeCaseObjectDeep(value[keys[i]]);
    }

    return obj;
  }

  return value;
};

class LncCredentialStore {
  account: Account;
  config: Config;

  constructor(account: Account, config: Config) {
    this.account = account;
    this.config = config;
  }

  get password() {
    return "";
  }

  set localKey(value: string) {
    this.config.localKey = value;
    this._save();
  }

  get localKey() {
    return this.config.localKey || "";
  }

  set remoteKey(value: string) {
    this.config.remoteKey = value;
    this._save();
  }

  get remoteKey() {
    return this.config.remoteKey || "";
  }

  get pairingPhrase() {
    return this.config.pairingPhrase;
  }

  set serverHost(value: string) {
    this.config.serverHost = value;
    this._save();
  }

  get serverHost() {
    return this.config.serverHost || DEFAULT_SERVER_HOST;
  }

  get isPaired() {
    return true;
  }

  async clear() {
    this.config.localKey = "";
    this.config.remoteKey = "";
    this._save();
  }

  private async _save() {
    const accounts = state.getState().accounts;
    const password = await state.getState().password();
    accounts[this.account.id].config = encryptData(
      this.config,
      password as string
    );
    state.setState({ accounts });
    await state.getState().saveToStorage();
    return true;
  }
}

class Lnc implements Connector {
  account: Account;
  config: Config;
  lnc: FixMe;

  constructor(account: Account, config: Config) {
    this.account = account;
    this.config = config;
    this.lnc = new LNC({
      credentialStore: new LncCredentialStore(account, config),
      namespace: this.account.id,
    });
  }

  async init(): Promise<void> {
    console.info("init LNC");
    try {
      await this.lnc.connect();
    } catch (error) {
      console.error("Init LNC failed", error);
      await this.unload();
    }
  }

  async unload() {
    if (!this.lnc) {
      return;
    }
    try {
      console.info("LNC disconnect");
      await this.lnc.disconnect();
      delete this.lnc;
    } catch (error) {
      console.error("Unload LNC failed", error);
    }
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
      ...flattenRequestMethods(Object.keys(methods)),
    ];
  }

  async requestMethod(
    method: string,
    args: Record<string, unknown>
  ): Promise<{ data: unknown }> {
    const lncCall = methods[method];
    if (!lncCall) {
      throw new Error(`${method} is not supported`);
    }

    const func = lncCall.split(".").reduce((obj: FixMe, prop: FixMe) => {
      return obj[prop];
    }, this.lnc);
    return func(args).then((data: FixMe) => {
      return { data: snakeCaseObjectDeep(data) };
    });
  }

  getInfo(): Promise<GetInfoResponse> {
    this.checkConnection();
    return this.lnc.lnd.lightning.GetInfo().then((data: FixMe) => {
      return {
        data: {
          alias: data.alias,
          pubkey: data.identityPubkey,
          color: data.color,
        },
      };
    });
  }

  getBalance(): Promise<GetBalanceResponse> {
    this.checkConnection();
    return this.lnc.lnd.lightning.ChannelBalance().then((data: FixMe) => {
      return {
        data: {
          balance: data.balance,
        },
      };
    });
  }

  private async getInvoices(): Promise<ConnectorTransaction[]> {
    this.checkConnection();
    const data = await this.lnc.lnd.lightning.ListInvoices({ reversed: true });

    const invoices: ConnectorTransaction[] = data.invoices
      .map((invoice: FixMe, index: number): ConnectorTransaction => {
        const custom_records =
          invoice.htlcs[0] && invoice.htlcs[0].customRecords;

        return {
          custom_records,
          id: `${invoice.paymentRequest}-${index}`,
          memo: invoice.memo,
          preimage: invoice.rPreimage,
          settled: invoice.settled,
          settleDate: parseInt(invoice.settleDate) * 1000,
          totalAmount: invoice.value,
          type: "received",
        };
      })
      .reverse();

    return invoices;
  }

  async getTransactions(): Promise<GetTransactionsResponse> {
    const incomingInvoices = await this.getInvoices();
    const outgoingInvoices = await this.getPayments();

    const transactions: ConnectorTransaction[] = mergeTransactions(
      incomingInvoices,
      outgoingInvoices
    );

    return {
      data: {
        transactions,
      },
    };
  }

  private async getPayments(): Promise<ConnectorTransaction[]> {
    const outgoingInvoicesResponse = await this.lnc.lnd.lightning.ListPayments({
      reversed: true,
      max_payments: 100,
      include_incomplete: false,
    });

    const outgoingInvoices: ConnectorTransaction[] =
      outgoingInvoicesResponse.payments.map(
        (payment: FixMe, index: number): ConnectorTransaction => {
          let memo = "Sent";
          if (payment.payment_request) {
            memo = (
              lightningPayReq
                .decode(payment.payment_request)
                .tags.find((tag) => tag.tagName === "description")?.data ||
              "Sent"
            ).toString();
          }
          return {
            id: `${payment.payment_request}-${index}`,
            memo: memo,
            preimage: payment.payment_preimage,
            settled: true,
            settleDate: parseInt(payment.creation_date) * 1000,
            totalAmount: payment.value_sat,
            type: "sent",
          };
        }
      );
    return outgoingInvoices;
  }

  // not yet implemented
  async connectPeer(): Promise<ConnectPeerResponse> {
    console.error(
      `${this.constructor.name} does not implement the getInvoices call`
    );
    throw new Error("Not yet supported with the currently used account.");
  }

  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    this.checkConnection();
    return this.lnc.lnd.lightning
      .LookupInvoice({ r_hash_str: args.paymentHash })
      .then((data: FixMe) => {
        return {
          data: {
            paid: data.settled,
          },
        };
      });
  }

  sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse> {
    this.checkConnection();
    return this.lnc.lnd.lightning
      .SendPaymentSync({
        payment_request: args.paymentRequest,
      })
      .then((data: FixMe) => {
        if (data.paymentError) {
          throw new Error(data.paymentError);
        }
        return {
          data: {
            preimage: utils.base64ToHex(data.paymentPreimage),
            paymentHash: utils.base64ToHex(data.paymentHash),
            route: {
              total_amt: data.paymentRoute.totalAmt,
              total_fees: data.paymentRoute.totalFees,
            },
          },
        };
      });
  }
  async keysend(args: KeysendArgs): Promise<SendPaymentResponse> {
    this.checkConnection();
    //See: https://gist.github.com/dellagustin/c3793308b75b6b0faf134e64db7dc915
    const dest_pubkey_hex = args.pubkey;
    const dest_pubkey_base64 = Hex.parse(dest_pubkey_hex).toString(Base64);

    const preimage = WordArray.random(32);
    const preimage_base64 = preimage.toString(Base64);
    const hash = SHA256(preimage).toString(Base64);

    //base64 encode the record values
    const records_base64: Record<string, string> = {};
    for (const key in args.customRecords) {
      records_base64[parseInt(key)] = UTF8.parse(
        args.customRecords[key]
      ).toString(Base64);
    }
    //mandatory record for keysend
    records_base64[5482373484] = preimage_base64;

    return this.lnc.lnd.lightning
      .SendPaymentSync({
        dest: dest_pubkey_base64,
        amt: args.amount,
        payment_hash: hash,
        dest_custom_records: records_base64,
      })
      .then((data: FixMe) => {
        if (data.paymentError) {
          throw new Error(data.paymentError);
        }
        return {
          data: {
            preimage: utils.base64ToHex(data.paymentPreimage),
            paymentHash: utils.base64ToHex(data.paymentHash),
            route: {
              total_amt: data.paymentRoute.totalAmt,
              total_fees: data.paymentRoute.totalFees,
            },
          },
        };
      });
  }

  signMessage(args: SignMessageArgs): Promise<SignMessageResponse> {
    this.checkConnection();
    return this.lnc.lnd.lightning
      .SignMessage({ msg: Base64.stringify(UTF8.parse(args.message)) })
      .then((data: FixMe) => {
        return {
          data: {
            message: args.message,
            signature: data.signature,
          },
        };
      });
  }

  makeInvoice(args: MakeInvoiceArgs): Promise<MakeInvoiceResponse> {
    this.checkConnection();
    return this.lnc.lnd.lightning
      .AddInvoice({ memo: args.memo, value: args.amount })
      .then((data: FixMe) => {
        return {
          data: {
            paymentRequest: data.paymentRequest,
            rHash: utils.base64ToHex(data.rHash),
          },
        };
      });
  }

  private checkConnection() {
    if (!this.lnc) {
      throw new Error("Account failed to load");
    }
    if (!this.lnc.isConnected) {
      throw new Error("Account is still loading");
    }
  }
}

export default Lnc;
