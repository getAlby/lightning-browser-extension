import Connector, {
  SendPaymentArgs,
  SendPaymentResponse,
  CheckPaymentArgs,
  CheckPaymentResponse,
  GetInfoResponse,
  GetBalanceResponse,
  MakeInvoiceArgs,
  MakeInvoiceResponse,
  SignMessageArgs,
  SignMessageResponse,
  VerifyMessageArgs,
  VerifyMessageResponse,
  KeysendArgs,
} from "./connector.interface";

import ApiClient from "@core-ln/rest";

interface Config {
  macaroon: string;
  url: string;
}

class CoreLightning implements Connector {
  config: Config;
  apiClient: ApiClient;

  constructor(config: Config) {
    this.config = config;
    this.apiClient = new ApiClient(config.url, config.macaroon);
  }

  init() {
    return Promise.resolve();
  }

  unload() {
    return Promise.resolve();
  }

  async getInfo(): Promise<GetInfoResponse> {
    const info = await this.apiClient.getinfo();
    return {
      data: {
        alias: info.alias,
        color: info.color,
        pubkey: info.id,
      },
    };
  }

  getBalance(): Promise<GetBalanceResponse> {
    return this.getChannelsBalance();
  }

  async sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse> {
    const payResponse = await this.apiClient.pay({
      // When Alby supports Bolt12, this can be a bolt12 offer too, even though the name is bolt11
      bolt11: args.paymentRequest,
    });
    return {
      data: {
        preimage: payResponse.payment_preimage,
        paymentHash: payResponse.payment_hash,
        route: {
          // TODO: Should this be sat or msat
          total_amt: Number(payResponse.amount_sent_msat),
          total_fees: Number(
            payResponse.amount_sent_msat - payResponse.amount_msat
          ),
        },
      },
    };
  }
  async keysend(args: KeysendArgs): Promise<SendPaymentResponse> {
    throw new Error("Not implemented!");
  }

  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    const paymentStatus = await this.apiClient.waitsendpay({
      timeout: "0",
      payment_hash: args.paymentHash,
    });
    return {
      data: {
        paid: paymentStatus.status === "complete",
      },
    };
  }

  async signMessage(args: SignMessageArgs): Promise<SignMessageResponse> {
    const signingResponse = await this.apiClient.signmessage({
      message: args.message,
    });
    return {
      data: {
        signature: signingResponse.zbase,
      },
    };
  }

  async verifyMessage(args: VerifyMessageArgs): Promise<VerifyMessageResponse> {
    const validationResult = await this.apiClient.checkmessage({
      zbase: args.signature,
      message: args.message,
    });
    return {
      data: {
        valid: validationResult.verified,
      },
    };
  }

  async makeInvoice(args: MakeInvoiceArgs): Promise<MakeInvoiceResponse> {
    const invoice = await this.apiClient.invoice({
      // TODO: Confirm unit of args.amount
      msatoshi: `${args.amount}sat`,
      description: args.memo,
      label: args.memo,
    });
    return {
      data: {
        paymentRequest: invoice.bolt11,
        rHash: invoice.payment_hash,
      },
    };
  }

  async getChannelsBalance() {
    const channelsBalance = await this.apiClient.channelLocalRemoteBal();
    return {
      data: {
        balance: channelsBalance.localBalance || 0,
        pending_open_balance: channelsBalance.pendingBalance || 0,
      },
    };
  }
}

export default CoreLightning;
