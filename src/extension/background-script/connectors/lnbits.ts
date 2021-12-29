import sha256 from "crypto-js/sha256";
import Hex from "crypto-js/enc-hex";
import { parsePaymentRequest } from "invoices";
import utils from "../../../common/lib/utils";
import HashKeySigner from "../../../common/utils/signer";
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
  adminkey: string;
  url: string;
}

class LnBits implements Connector {
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
    return this.request(
      "GET",
      "/api/v1/wallet",
      this.config.adminkey,
      undefined,
      {}
    ).then((data) => {
      return {
        data: {
          alias: data.name,
        },
      };
    });
  }

  getBalance(): Promise<GetBalanceResponse> {
    return this.request(
      "GET",
      "/api/v1/wallet",
      this.config.adminkey,
      undefined,
      {}
    ).then((data) => {
      // TODO better amount handling
      const balanceInSats = data.balance / 1000;
      return {
        data: {
          balance: balanceInSats,
        },
      };
    });
  }

  sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse> {
    const paymentRequestDetails = parsePaymentRequest({
      request: args.paymentRequest,
    });
    const amountInSats = paymentRequestDetails.tokens;
    return this.request("POST", "/api/v1/payments", this.config.adminkey, {
      bolt11: args.paymentRequest,
      out: true,
    })
      .then((data) => {
        // TODO: how do we get the total amount here??
        return this.checkPayment({ paymentHash: data.payment_hash }).then(
          ({ data: checkData }) => {
            return {
              data: {
                preimage: checkData.preimage || "",
                paymentHash: data.payment_hash,
                route: { total_amt: amountInSats, total_fees: 0 },
              },
            };
          }
        );
      })
      .catch((e) => {
        return { error: e.message };
      });
  }

  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    const data = await this.request(
      "GET",
      `/api/v1/payments/${args.paymentHash}`,
      this.config.adminkey
    );
    return {
      data: {
        paid: data.isPaid,
        ...data,
      },
    };
  }

  signMessage(args: SignMessageArgs): Promise<SignMessageResponse> {
    // make sure we got the config to create a new key
    if (!this.config.url || !this.config.adminkey) {
      return Promise.reject(new Error("Missing config"));
    }
    if (!args.message) {
      return Promise.reject(new Error("Invalid message"));
    }
    const message = utils.stringToUint8Array(args.message);
    // create a signing key from the lnbits URL and the adminkey
    const keyHex = sha256(
      `LBE-LNBITS-${this.config.url}-${this.config.adminkey}`
    ).toString(Hex);

    if (!keyHex) {
      return Promise.reject(new Error("Could not create key"));
    }
    const signer = new HashKeySigner(keyHex);
    const signedMessageDERHex = signer.sign(message).toDER("hex");
    // make sure we got some signed message
    if (!signedMessageDERHex) {
      return Promise.reject(new Error("Signing failed"));
    }
    return Promise.resolve({
      data: {
        signature: signedMessageDERHex,
      },
    });
  }

  verifyMessage(args: VerifyMessageArgs): Promise<VerifyMessageResponse> {
    // create a signing key from the lnbits URL and the adminkey
    const keyHex = sha256(
      `LBE-LNBITS-${this.config.url}-${this.config.adminkey}`
    ).toString(Hex);

    if (!keyHex) {
      return Promise.reject(new Error("Could not create key"));
    }
    const signer = new HashKeySigner(keyHex);
    return Promise.resolve({
      data: {
        valid: signer.verify(args.message, args.signature),
      },
    });
  }

  makeInvoice(args: MakeInvoiceArgs): Promise<MakeInvoiceResponse> {
    return this.request("POST", "/api/v1/payments", this.config.adminkey, {
      amount: args.amount,
      memo: args.memo,
      out: false,
    }).then((data) => {
      return {
        data: {
          paymentRequest: data.payment_request,
          rHash: data.payment_hash,
        },
      };
    });
  }

  async request(
    method: string,
    path: string,
    apiKey: string,
    args?: Record<string, unknown>,
    defaultValues?: Record<string, unknown>
  ) {
    let body = null;
    let query = "";
    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/json");
    headers.append("X-Api-Key", apiKey);

    if (method === "POST") {
      body = JSON.stringify(args);
    } else if (args !== undefined) {
      query = `?`; //`?${stringify(args)}`;
    }
    const res = await fetch(this.config.url + path + query, {
      method,
      headers,
      body,
    });
    if (!res.ok) {
      const errBody = await res.json();
      console.log("errBody", errBody);
      throw new Error(errBody.detail);
    }
    let data = await res.json();
    if (defaultValues) {
      data = Object.assign(Object.assign({}, defaultValues), data);
    }
    return data;
  }
}

export default LnBits;
