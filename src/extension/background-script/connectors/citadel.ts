import Citadel from "@runcitadel/sdk/browser/index.js";

enum Invoice_InvoiceState {
  OPEN = 0,
  SETTLED = 1,
  CANCELED = 2,
  ACCEPTED = 3,
  UNRECOGNIZED = -1,
}

import Connector, {
  SendPaymentArgs,
  SendPaymentResponse,
  GetInfoResponse,
  GetBalanceResponse,
  MakeInvoiceArgs,
  MakeInvoiceResponse,
  SignMessageArgs,
  SignMessageResponse,
  VerifyMessageArgs,
  VerifyMessageResponse,
  CheckPaymentArgs,
  CheckPaymentResponse,
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
    const info = await this.citadel.middleware.lnd.info.generalInfo();
    return {
      data: {
        alias: info.alias,
        pubkey: info.identityPubkey,
        color: info.color,
      },
    };
  }

  async getBalance(): Promise<GetBalanceResponse> {
    await this.ensureLogin();
    const balance = parseInt(
      (await this.citadel.middleware.lnd.wallet.lightningBalance()).localBalance
        ?.sat as string
    );
    return {
      data: {
        balance,
      },
    };
  }

  async sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse> {
    await this.ensureLogin();
    const res = await this.citadel.middleware.lnd.lightning.payInvoice(
      args.paymentRequest
    );
    console.log(res);
    return {
      data: {
        preimage: res.paymentPreimage,
        paymentHash: res.paymentHash,
        route: {
          total_amt: Math.round(
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
        signature: await this.citadel.middleware.lnd.signMessage(args.message),
      },
    };
  }

  async verifyMessage(args: VerifyMessageArgs): Promise<VerifyMessageResponse> {
    await this.ensureLogin();
    const res = await this.citadel.middleware.lnd.validateMessage(
      args.message,
      args.signature
    );
    return {
      data: res,
    };
  }

  protected async ensureLogin() {
    try {
      await this.citadel.refresh();
    } catch {
      await this.citadel.login(this.config.password, "");
    }
  }

  async makeInvoice(args: MakeInvoiceArgs): Promise<MakeInvoiceResponse> {
    await this.ensureLogin();
    const res = await this.citadel.middleware.lnd.lightning.addInvoice(
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
    const res = await this.citadel.middleware.lnd.lightning.invoiceInfo(
      args.paymentHash
    );
    return {
      data: {
        paid: res.state === Invoice_InvoiceState.SETTLED,
      },
    };
  }
}

export default CitadelConnector;
