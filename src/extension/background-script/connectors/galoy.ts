import axios from "axios";
import { AxiosRequestConfig } from "axios";
import lightningPayReq from "bolt11";

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

  init() {
    return Promise.resolve();
  }

  unload() {
    return Promise.resolve();
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
    return this.request(query).then(({ data, errors }) => {
      const errs = errors || data.me.errors;
      if (errs && errs.length) {
        throw new Error(errs[0].message || JSON.stringify(errs));
      }

      const alias = data.me.username
        ? data.me.username.substr(0, 10)
        : data.me.id.substr(0, 8);
      return {
        data: {
          alias,
        },
      };
    });
  }

  // not yet implemenetd
  getInvoices() {
    return new Error("Has not been implemneted on this connector: getInvoices");
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
    return this.request(query).then(({ data, errors }) => {
      const errs = errors || data.me.errors;
      if (errs && errs.length) {
        throw new Error(errs[0].message || JSON.stringify(errs));
      }

      const { defaultWalletId, wallets }: GaloyDefaultAccount =
        data.me.defaultAccount;
      const defaultWallet = wallets.find((w) => w.id === defaultWalletId);
      if (defaultWallet) {
        return {
          data: {
            balance: defaultWallet.balance,
          },
        };
      } else {
        throw new Error("Valid wallet not found");
      }
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

    const paymentRequestDetails = lightningPayReq.decode(args.paymentRequest);
    const amountInSats = paymentRequestDetails.satoshis || 0;
    const paymentHash = paymentRequestDetails.tagsObject.payment_hash || "";

    return this.request(query).then(({ data, errors }) => {
      const errs = errors || data.lnInvoicePaymentSend.errors;
      if (errs && errs.length) {
        throw new Error(errs[0].message || JSON.stringify(errs));
      }

      switch (data.lnInvoicePaymentSend.status) {
        case "ALREADY_PAID":
          throw new Error("Invoice was already paid.");
        case "FAILURE":
          throw new Error("Payment failed.");
        case "PENDING":
          return {
            data: {
              preimage: "No preimage, payment still pending",
              paymentHash,
              route: { total_amt: amountInSats, total_fees: 0 },
            },
          };
        default:
          return {
            data: {
              preimage: "No preimage received",
              paymentHash,
              route: { total_amt: amountInSats, total_fees: 0 },
            },
          };
      }
    });
  }

  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    const TRANSACTIONS_PER_PAGE = 20;

    const query = {
      query: `
        query transactionsList($first: Int, $after: String) {
          me {
            defaultAccount {
              defaultWalletId
              wallets {
                id
                walletCurrency
                transactions(first: $first, after: $after) {
                  pageInfo {
                      hasNextPage
                  }
                  edges {
                    cursor
                    node {
                      status
                      initiationVia {
                        ... on InitiationViaLn {
                            paymentHash
                        }
                      }
                      settlementVia {
                        ... on SettlementViaLn {
                            paymentSecret
                        }
                        ... on SettlementViaIntraLedger {
                          __typename
                          counterPartyWalletId
                          counterPartyUsername
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: "",
    };

    let lastSeenCursor = null;
    let result: true | CheckPaymentResponse = true;
    while (result === true) {
      query.variables = JSON.stringify({
        first: TRANSACTIONS_PER_PAGE,
        after: lastSeenCursor,
      });

      result = await this.request(query).then(({ data, errors }) => {
        const errs = errors || data.me.errors;
        if (errs && errs.length) {
          throw new Error(errs[0].message || JSON.stringify(errs));
        }

        const account: GaloyTransactionsAccount = data.me.defaultAccount;
        const wallet = account.wallets.find(
          (w) => w.id === account.defaultWalletId
        );

        // There should always be a wallet that corresponds to 'defaultWalletId'
        if (wallet === undefined) {
          throw new Error("Bad data received.");
        }

        if (wallet.walletCurrency !== "BTC") {
          throw new Error("Non-BTC wallets not implemented yet.");
        }

        const txEdges = wallet.transactions.edges;
        const tx = txEdges.find(
          (tx) => tx.node.initiationVia.paymentHash === args.paymentHash
        );
        if (tx !== undefined) {
          return {
            data: {
              paid: tx.node.status === "SUCCESS",
              preimage: tx.node.settlementVia.__typename
                ? "Payment executed internally"
                : tx.node.settlementVia.paymentSecret || "No preimage received",
            },
          };
        }

        if (!wallet.transactions.pageInfo.hasNextPage) {
          throw new Error(
            `Transaction not found for payment hash: ${args.paymentHash}`
          );
        }

        lastSeenCursor = txEdges[txEdges.length - 1].cursor;
        return true;
      });
    }
    return result;
  }

  async keysend(args: KeysendArgs): Promise<SendPaymentResponse> {
    throw new Error("not supported");
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
    return this.request(query).then(({ data, errors }) => {
      const errs = errors || data.lnInvoiceCreate.errors;
      if (errs && errs.length) {
        throw new Error(errs[0].message || JSON.stringify(errs));
      }

      return {
        data: {
          paymentRequest: data.lnInvoiceCreate.invoice.paymentRequest,
          rHash: data.lnInvoiceCreate.invoice.paymentHash,
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

type GaloyTransactionsAccount = {
  defaultWalletId: string;
  wallets: GaloyWallet[];
};

type GaloyWallet = {
  id: string;
  walletCurrency: string;
  transactions: {
    pageInfo: {
      hasNextPage: boolean;
    };
    edges: {
      cursor: string;
      node: {
        status: "FAILURE" | "PENDING" | "SUCCESS";
        initiationVia: {
          paymentHash: string;
        };
        settlementVia:
          | {
              __typename: undefined;
              paymentSecret: string;
            }
          | {
              __typename: "SettlementViaIntraledger";
              counterPartyWalletId: string;
              counterPartyUsername: string;
            };
      };
    }[];
  };
};

export default Galoy;
