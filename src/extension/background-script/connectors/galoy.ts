import axios from "axios";
import { parsePaymentRequest } from "invoices";
import { AxiosRequestConfig } from "axios";
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
  walletId: string;
  url: string;
  accessToken: string;
}

class Galoy implements Connector {
  config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  getInfo(): Promise<GetInfoResponse> {
    const query = {
      query: `
        query getinfo {
          me {
              id
              username
          }
        }
      `,
    };
    return this.request(query).then((data) => {
      const alias = data.data.me.username
        ? data.data.me.username.substr(0, 10)
        : data.data.me.id.substr(0, 8);
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
            defaultAccount {
              defaultWalletId
              wallets {
                id
                balance
              }
            }
          }
        }
      `,
    };
    return this.request(query).then((data) => {
      if (data.error) {
        return {
          error: data.error?.errors?.[0]?.message || JSON.stringify(data.error),
        };
      }
      const { defaultWalletId, wallets }: GaloyDefaultAccount =
        data.data.me.defaultAccount;
      const defaultWallet = wallets.find((w) => w.id === defaultWalletId);
      return defaultWallet
        ? {
            data: {
              balance: defaultWallet.balance,
            },
          }
        : { error: "Valid wallet not found" };
    });
  }

  sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse> {
    const query = {
      query: `
        mutation lnInvoicePaymentSend($input: LnInvoicePaymentInput!) {
          lnInvoicePaymentSend(input:$input) {
            status
            errors {
              message
            }
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
      if (data.data.lnInvoicePaymentSend.errors?.[0]?.message) {
        return { error: data.data.lnInvoicePaymentSend.errors[0].message };
      }
      if (data.error) {
        return {
          error: data.error?.errors?.[0]?.message || JSON.stringify(data.error),
        };
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

  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    return {
      data: {
        paid: false,
        preimage: "",
      },
    };
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
      if (data.data.lnInvoiceCreate.errors?.[0]?.message) {
        return { error: data.data.lnInvoiceCreate.errors[0].message };
      }
      if (data.error) {
        return {
          error: data.error?.errors?.[0]?.message || JSON.stringify(data.error),
        };
      }
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

type GaloyDefaultAccount = {
  defaultWalletId: string;
  wallets: {
    id: string;
    balance: number;
  }[];
};

export default Galoy;
