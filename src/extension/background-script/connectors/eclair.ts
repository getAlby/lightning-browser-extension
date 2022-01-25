import Base64 from "crypto-js/enc-base64";
import UTF8 from "crypto-js/enc-utf8";
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
} from "./connector.interface";

interface Config {
  url: string;
  password: string;
}

class Eclair implements Connector {
  config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  init() {
    return Promise.resolve();
  }

  unload() {
    return Promise.resolve();
  }

  getInfo(): Promise<GetInfoResponse> {
    return this.request("/getinfo", undefined, {}).then((data) => {
      return {
        data: {
          alias: data.alias,
          pubkey: data.nodeId,
          color: data.color,
        },
      };
    });
  }

  async getBalance(): Promise<GetBalanceResponse> {
    const channels = await this.request("/channels");
    const total = channels
      .map(
        (
          channel: Record<
            string,
            Record<
              string,
              Record<string, Record<string, Record<string, number>>>
            >
          >
        ) => channel.data?.commitments?.localCommit?.spec?.toLocal || 0
      )
      .reduce((acc: number, b: number) => acc + b, 0);
    return {
      data: {
        balance: total / 1000,
      },
    };
  }

  async sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse> {
    const { paymentHash, paymentPreimage } = await this.request("/payinvoice", {
      invoice: args.paymentRequest,
      blocking: true,
    });

    const info = await this.request("/getsentinfo", {
      paymentHash,
    });
    const { status, recipientAmount } = info[info.length - 1];

    return {
      data: {
        preimage: paymentPreimage,
        paymentHash,
        route: {
          total_amt: Math.round(recipientAmount / 1000),
          total_fees: status.feesPaid,
        },
      },
    };
  }

  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    const data = await this.request("/getreceivedinfo", {
      paymentHash: args.paymentHash,
    });

    return {
      data: {
        paid: data && data.status.type === "received",
      },
    };
  }

  async signMessage(args: SignMessageArgs): Promise<SignMessageResponse> {
    const { signature } = await this.request("/signmessage", {
      msg: Base64.stringify(UTF8.parse(args.message)),
    });

    return {
      data: {
        signature: signature as string,
      },
    };
  }

  async verifyMessage(args: VerifyMessageArgs): Promise<VerifyMessageResponse> {
    const { valid } = await this.request("/verifymessage", {
      msg: Base64.stringify(UTF8.parse(args.message)),
      sig: args.signature,
    });

    return {
      data: {
        valid,
      },
    };
  }

  async makeInvoice(args: MakeInvoiceArgs): Promise<MakeInvoiceResponse> {
    const res = await this.request("/createinvoice", {
      description: args.memo,
      amountMsat: args.amount * 1000,
    });

    return {
      data: {
        paymentRequest: res.serialized,
        rHash: res.paymentHash,
      },
    };
  }

  async request(
    path: string,
    params?: Record<string, unknown>,
    defaultValues?: Record<string, unknown>
  ) {
    const url = new URL(
      this.config.url.startsWith("http")
        ? this.config.url
        : "http://" + this.config.url
    );
    url.pathname = path;
    const headers = new Headers();
    headers.append("Accept", "application/json");
    const password = Base64.stringify(UTF8.parse(":" + this.config.password));
    headers.append("Authorization", "Basic " + password);

    const body = new FormData();
    if (params) {
      for (const k in params) {
        body.append(k, params[k] as string);
      }
    }

    const res = await fetch(url.toString(), {
      method: "POST",
      headers,
      body,
    });

    if (!res.ok) {
      let errBody;
      try {
        const textBody = await res.text();
        try {
          errBody = JSON.parse(textBody);
          if (!errBody.error) {
            throw new Error("error response: " + textBody.slice(0, 200));
          }
        } catch (err) {
          throw new Error("got a non-JSON response: " + textBody.slice(0, 200));
        }
      } catch (err) {
        throw new Error(res.statusText);
      }
      console.log("eclair error", errBody.error);
      throw new Error(errBody.error);
    }

    let data = await res.json();
    if (defaultValues) {
      data = Object.assign(Object.assign({}, defaultValues), data);
    }
    return data;
  }
}

export default Eclair;
