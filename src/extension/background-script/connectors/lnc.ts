import LNC from "@lightninglabs/lnc-web";
import { CredentialStore } from "@lightninglabs/lnc-web";
import Base64 from "crypto-js/enc-base64";
import Hex from "crypto-js/enc-hex";
import UTF8 from "crypto-js/enc-utf8";
import WordArray from "crypto-js/lib-typedarrays";
import SHA256 from "crypto-js/sha256";
import { encryptData } from "~/common/lib/crypto";
import utils from "~/common/lib/utils";

import state from "../state";
import Connector, {
  CheckPaymentArgs,
  CheckPaymentResponse,
  SendPaymentArgs,
  SendPaymentResponse,
  GetInfoResponse,
  GetBalanceResponse,
  GetInvoicesResponse,
  ConnectPeerResponse,
  ConnectorInvoice,
  MakeInvoiceArgs,
  MakeInvoiceResponse,
  SignMessageArgs,
  SignMessageResponse,
  KeysendArgs,
} from "./connector.interface";

interface Config {
  pairingPhrase: string;
  localKey?: string;
  remoteKey?: string;
  serverHost?: string;
}

const methods: Record<string, string> = {
  getinfo: "lnd.lightning.GetInfo",
  listchannels: "lnd.lightning.ListChannels",
  listinvoices: "lnd.lightning.ListInvoices",
  channelbalance: "lnd.lightning.ChannelBalance",
  walletbalance: "lnd.lightning.WalletBalance",
  openchannel: "lnd.lightning.OpenChannelSync",
  connectpeer: "lnd.lightning.ConnectPeer",
  disconnectpeer: "lnd.lightning.DisconnectPeer",
  estimatefee: "lnd.lightning.EstimateFee",
  getchaninfo: "lnd.lightning.GetChanInfo",
  getnetworkinfo: "lnd.lightning.GetNetworkInfo",
  getnodeinfo: "lnd.lightning.GetNodeInfo",
  gettransactions: "lnd.lightning.GetTransactions",
  listpayments: "lnd.lightning.ListPayments",
  listpeers: "lnd.lightning.ListPeers",
  lookupinvoice: "lnd.lightning.LookupInvoice",
  queryroutes: "lnd.lightning.QueryRoutes",
  verifymessage: "lnd.lightning.VerifyMessage",
  sendtoroute: "lnd.lightning.SendToRouteSync",
  decodepayreq: "lnd.lightning.DecodePayReq",
  routermc: "lnd.router.QueryMissionControl",
  addinvoice: "lnd.lightning.AddInvoice",
};

const DEFAULT_SERVER_HOST = "mailbox.terminal.lightning.today:443";

class LncCredentialStore implements CredentialStore {
  config: Config;

  constructor(config: Config) {
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
    const password = state.getState().password as string;
    const currentAccountId = state.getState().currentAccountId as string;
    accounts[currentAccountId].config = encryptData(this.config, password);
    state.setState({ accounts });
    await state.getState().saveToStorage();
    return true;
  }
}

class Lnc implements Connector {
  config: Config;
  lnc: FixMe;

  constructor(config: Config) {
    this.config = config;
    this.lnc = new LNC({
      credentialStore: new LncCredentialStore(config),
    });
  }

  async init(): Promise<void> {
    console.info("init LNC");
    await this.lnc.connect();
  }

  async unload() {
    console.info("LNC disconnect");
    await this.lnc.disconnect();
    return new Promise<void>((resolve) => {
      // give lnc a bit time to disconnect.
      // not sure what there happens, best would be to have disconnect() return a promise
      setTimeout(() => {
        // TODO: investigate garbage collection
        delete this.lnc;
        resolve();
      }, 1000);
    });
  }

  get supportedMethods() {
    return Object.keys(methods);
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
      return { data };
    });
  }

  getInfo(): Promise<GetInfoResponse> {
    if (!this.lnc.isConnected) {
      return Promise.reject(new Error("Account is still loading"));
    }
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
    if (!this.lnc.isConnected) {
      return Promise.reject(new Error("Account is still loading"));
    }
    return this.lnc.lnd.lightning.ChannelBalance().then((data: FixMe) => {
      return {
        data: {
          balance: data.balance,
        },
      };
    });
  }

  async getInvoices(): Promise<GetInvoicesResponse> {
    if (!this.lnc.isConnected) {
      throw new Error("Account is still loading");
    }
    const data = await this.lnc.lnd.lightning.ListInvoices({ reversed: true });

    const invoices: ConnectorInvoice[] = data.invoices
      .map((invoice: FixMe, index: number): ConnectorInvoice => {
        const custom_records =
          invoice.htlcs[0] && invoice.htlcs[0].custom_records;

        return {
          custom_records,
          id: `${invoice.payment_request}-${index}`,
          memo: invoice.memo,
          preimage: invoice.r_preimage,
          settled: invoice.settled,
          settleDate: parseInt(invoice.settle_date) * 1000,
          totalAmount: invoice.value,
          type: "received",
        };
      })
      .reverse();

    return {
      data: {
        invoices,
      },
    };
  }

  // not yet implemented
  async connectPeer(): Promise<ConnectPeerResponse> {
    console.error(
      `${this.constructor.name} does not implement the getInvoices call`
    );
    throw new Error("Not yet supported with the currently used account.");
  }

  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    if (!this.lnc.isConnected) {
      throw new Error("Account is still loading");
    }
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
    if (!this.lnc.isConnected) {
      return Promise.reject(new Error("Account is still loading"));
    }
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
    if (!this.lnc.isConnected) {
      throw new Error("Account is still loading");
    }
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
    if (!this.lnc.isConnected) {
      return Promise.reject(new Error("Account is still loading"));
    }
    // use v2 to use the key locator (key_loc)
    // return this.request("POST", "/v2/signer/signmessage", {
    return this.lnc.lnd.lightning
      .SignMessage({ msg: args.message })
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
    if (!this.lnc.isConnected) {
      return Promise.reject(new Error("Account is still loading"));
    }
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
}

export default Lnc;
