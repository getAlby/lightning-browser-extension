import axios from "axios";
import sha256 from "crypto-js/sha256";
import Hex from "crypto-js/enc-hex";
import { parsePaymentRequest } from "invoices";
import { AxiosRequestConfig } from "axios";
import Base from "./base";
import utils from "../../../common/lib/utils";
import HashKeySigner from "../../../common/utils/signer";
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
} from "./connector.interface";

export default class Galoy extends Base implements Connector {
  getInfo(): Promise<GetInfoResponse> {
    const query = {
      query: `
        query getinfo {
          me {
              id
              username
              defaultAccount {
                wallets {
                  id
              }
            }
          }
        }
      `,
    };
    return this.request(query).then((data) => {
      const alias: string = (data.data.me.username || data.data.me.id).substr(
        0,
        10
      );
      return {
        data: {
          alias,
        },
      };
    });
  }

  getBalance(): Promise<GetBalanceResponse> {
    const query = {
      query: `
        query getinfo {
          me {
              id
              username
              defaultAccount {
                wallets {
                  balance
              }
            }
          }
        }
      `,
    };
    return this.request(query).then((data) => {
      return {
        data: {
          balance: data.data.me.defaultAccount.wallets[0].balance,
        },
      };
    });
  }

  sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse> {
    const query = {
      query: `
        mutation lnInvoicePaymentSend($input: LnInvoicePaymentInput!) {
          lnInvoicePaymentSend(input:$input) {
            status
          }
        }
      `,
      variables: {
        input: {
          walletId: this.config.walletId,
          paymentRequest: args.paymentRequest,
          memo: "Sent via Alby",
        },
      },
    };

    const { tokens: amountInSats, payment: paymentHash } = parsePaymentRequest({
      request: args.paymentRequest,
    });

    return this.request(query).then((data) => {
      if (data.data.lnInvoicePaymentSend.errors?.message) {
        return { error: data.data.lnInvoicePaymentSend.errors?.message };
      }
      return {
        data: {
          preimage: "No preimage received",
          paymentHash,
          route: { total_amt: amountInSats, total_fees: 0 },
        },
      };
    });
  }

  signMessage(args: SignMessageArgs): Promise<SignMessageResponse> {
    return Promise.reject(new Error("Not yet supported with Galoy."));
  }

  verifyMessage(args: VerifyMessageArgs): Promise<VerifyMessageResponse> {
    return Promise.reject(new Error("Not yet supported with Galoy."));
  }

  // TODO: walletId is required here
  // error:  message: "Variable \"$input\" got invalid value { amount: 200, memo: \"test\" }; Field \"walletId\" of required type \"WalletId!\" was not provided.", code: "BAD_USER_INPUT", locations: […]
  makeInvoice(args: MakeInvoiceArgs): Promise<MakeInvoiceResponse> {
    const query = {
      query: `
        mutation lnInvoiceCreate($input: LnInvoiceCreateInput!) {
          lnInvoiceCreate(input: $input) {
            invoice {
              paymentRequest
              paymentHash
              paymentSecret
              satoshis
            }
            errors {
              message
            }
          }
        }
            `,
      variables: {
        input: {
          walletId: this.config.walletId,
          amount: args.amount,
          memo: args.memo,
        },
      },
    };
    return this.request(query).then((data) => {
      return {
        data: {
          paymentRequest: data.data.lnInvoiceCreate.invoice.paymentRequest,
          rHash: data.data.lnInvoiceCreate.invoice.paymentHash,
        },
      };
    });
  }

  async request(query: { query: string }) {
    const reqConfig: AxiosRequestConfig = {
      method: "POST",
      url: this.config.url,
      responseType: "json",
      headers: {
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.accessToken}`,
      },
    };
    reqConfig.data = query;
    let data;
    try {
      const res = await axios(reqConfig);
      data = res.data;
    } catch (e) {
      console.error(e);
      if (e instanceof Error) throw new Error(e.message);
    }
    return data;
  }
}
