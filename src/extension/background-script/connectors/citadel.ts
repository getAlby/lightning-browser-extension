import Citadel from "@runcitadel/sdk-next";

import Connector, {
  ConnectPeerResponse,
  SendPaymentArgs,
  SendPaymentResponse,
  GetInfoResponse,
  GetBalanceResponse,
  GetInvoicesResponse,
  MakeInvoiceArgs,
  MakeInvoiceResponse,
  SignMessageArgs,
  SignMessageResponse,
  CheckPaymentArgs,
  CheckPaymentResponse,
  KeysendArgs,
} from "./connector.interface";

interface Config {
  url: string;
  password: string;
}

class CitadelConnector implements Connector {
  config: Config;
  citadel: Citadel;

  constructor(config: Config) {
    this.config = config;
    this.citadel = new Citadel(config.url);
  }

  init() {
    return Promise.resolve();
  }

  unload() {
    return Promise.resolve();
  }

  async getInfo(): Promise<GetInfoResponse> {
    await this.ensureLogin();
    const info = await this.citadel.lightning.info.generalInfo();
    return {
      data: {
        alias: info.alias,
        pubkey: info.identityPubkey,
        color: info.color,
      },
    };
  }

  // not yet implemented
  async getInvoices(): Promise<GetInvoicesResponse> {
    console.error(
      `Not yet supported with the currently used account: ${this.constructor.name}`
    );
    throw new Error(
      `${this.constructor.name}: "getInvoices" is not yet supported. Contact us if you need it.`
    );
  }

  // not yet implemented
  async connectPeer(): Promise<ConnectPeerResponse> {
    console.error(
      `${this.constructor.name} does not implement the getInvoices call`
    );
    throw new Error("Not yet supported with the currently used account.");
  }

  async getBalance(): Promise<GetBalanceResponse> {
    await this.ensureLogin();
    const balance = parseInt(
      (await this.citadel.lightning.wallet.lightningBalance()).localBalance
        ?.sat as string
    );
    return {
      data: {
        balance,
      },
    };
  }
  async keysend(args: KeysendArgs): Promise<SendPaymentResponse> {
    throw new Error("not supported");
  }
  async sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse> {
    await this.ensureLogin();
    const res = await this.citadel.lightning.lightning.payInvoice(
      args.paymentRequest
    );
    return {
      data: {
        preimage: res.paymentPreimage,
        paymentHash: res.paymentHash,
        route: {
          total_amt: Math.floor(
            parseInt(res.paymentRoute?.totalAmtMsat as string) / 1000
          ),
          total_fees: parseInt(res.paymentRoute?.totalFeesMsat as string),
        },
      },
    };
  }

  async signMessage(args: SignMessageArgs): Promise<SignMessageResponse> {
    await this.ensureLogin();
    return {
      data: {
        message: args.message,
        signature: await this.citadel.lightning.signMessage(args.message),
      },
    };
  }

  protected async ensureLogin() {
    try {
      await this.citadel.auth.refresh();
    } catch {
      await this.citadel.auth.login(this.config.password, "");
    }
  }

  async makeInvoice(args: MakeInvoiceArgs): Promise<MakeInvoiceResponse> {
    await this.ensureLogin();
    const res = await this.citadel.lightning.lightning.addInvoice(
      args.amount.toString(),
      args.memo
    );
    return {
      data: {
        paymentRequest: res.paymentRequest,
        rHash: res.rHashStr,
      },
    };
  }

  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    await this.ensureLogin();
    return {
      data: {
        paid: await this.citadel.lightning.lightning.isPaid(args.paymentHash),
      },
    };
  }
}

export default CitadelConnector;
