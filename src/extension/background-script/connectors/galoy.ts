import fetchAdapter from "@vespaiach/axios-fetch-adapter";
import axios, { AxiosRequestConfig } from "axios";
import lightningPayReq from "bolt11";
import { ACCOUNT_CURRENCIES, CURRENCIES } from "~/common/constants";
import { getCurrencyRateWithCache } from "~/extension/background-script/actions/cache/getCurrencyRate";
import { Account } from "~/types";
import Connector, {
  CheckPaymentArgs,
  CheckPaymentResponse,
  ConnectPeerResponse,
  ConnectorTransaction,
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

type GaloyCurrencies = Extract<ACCOUNT_CURRENCIES, "BTC" | "USD">;

interface Config {
  walletId: string;
  url: string;
  headers?: Headers; // optional for backward compatibility
  apiCompatibilityMode?: boolean; // optional for backward compatibility
  accessToken?: string; // only present in old connectors
  currency?: GaloyCurrencies; // default is BTC
}

class Galoy implements Connector {
  account: Account;
  config: Config;

  constructor(account: Account, config: Config) {
    this.account = account;
    // assuming that if there is an accessToken left over, headers are not stored
    const accessToken = config.accessToken;
    this.config = {
      ...config,
      headers: config.headers || this.getLegacyHeaders(accessToken || ""),
      apiCompatibilityMode:
        config.apiCompatibilityMode !== undefined
          ? config.apiCompatibilityMode
          : true,
    };
  }

  getLegacyHeaders(accessToken: string): Headers {
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };
  }

  init() {
    return Promise.resolve();
  }

  unload() {
    return Promise.resolve();
  }

  toFiatInt(amount: number, currency: GaloyCurrencies): number {
    return Math.round(amount * 100);
  }

  toFiatFloat(amount: number, currency: GaloyCurrencies): number {
    return amount / 100;
  }

  get supportedMethods() {
    return [
      "getInfo",
      "makeInvoice",
      "sendPayment",
      "sendPaymentAsync",
      "signMessage",
      "getBalance",
    ];
  }

  async getInfo(): Promise<GetInfoResponse> {
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

  // not yet implemented
  async connectPeer(): Promise<ConnectPeerResponse> {
    console.error(
      `${this.constructor.name} does not implement the getInvoices call`
    );
    throw new Error("Not yet supported with the currently used account.");
  }

  async getTransactions(): Promise<GetTransactionsResponse> {
    const transactionsPerPage = 20;
    let pageCount = 0;
    let lastSeenCursor: string | null = null;
    let hasNextPage = true;
    const transactions: ConnectorTransaction[] = [];

    // list a maximum of 5 pages of transactions
    while (hasNextPage && pageCount < 5) {
      const variablesObj: TransactionListVariables = {
        first: transactionsPerPage,
      };
      if (lastSeenCursor !== null) {
        variablesObj.after = lastSeenCursor;
      }

      const query = {
        query: `
          query transactionsList($first: Int, $after: String) {
            me {
              defaultAccount {
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
                        createdAt
                        settlementAmount
                        memo
                        direction
                        initiationVia {
                          ... on InitiationViaLn {
                            paymentHash
                          }
                        }
                        settlementVia {
                          ... on SettlementViaLn {
                            ${
                              this.config.apiCompatibilityMode
                                ? "paymentSecret"
                                : "preImage"
                            }
                          }
                          ... on SettlementViaIntraLedger {
                            ${
                              this.config.apiCompatibilityMode
                                ? "counterPartyWalletId"
                                : "preImage"
                            }
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
        variables: variablesObj,
      };

      const response = await this.request(query);
      const errs = response.errors || response.data.me.errors;
      if (errs && errs.length) {
        throw new Error(errs[0].message || JSON.stringify(errs));
      }

      const wallets: GaloyWallet[] = response.data.me.defaultAccount.wallets;
      const targetWallet = wallets.find((w) => w.id === this.config.walletId);

      if (targetWallet) {
        if (targetWallet.walletCurrency !== (this.config.currency || "BTC")) {
          throw new Error(
            "Wallet currency does not match the account currency. " +
              targetWallet.walletCurrency +
              " != " +
              (this.config.currency || "BTC")
          );
        }

        for (const edge of targetWallet.transactions.edges) {
          const tx = edge.node;
          // Determine transaction type based on the direction field
          const transactionType: "received" | "sent" =
            tx.direction === "RECEIVE" ? "received" : "sent";
          const currency = targetWallet.walletCurrency || "BTC";
          // Do not display a double negative if sent
          let absSettlementAmount = Math.abs(tx.settlementAmount);
          let displayAmount: [number, ACCOUNT_CURRENCIES] | undefined =
            undefined;
          if (currency !== "BTC") {
            const rate = await getCurrencyRateWithCache(CURRENCIES[currency]);
            absSettlementAmount = this.toFiatFloat(
              absSettlementAmount,
              currency
            );
            displayAmount = [absSettlementAmount, CURRENCIES[currency]];
            absSettlementAmount = Math.floor(absSettlementAmount / rate);
          }

          const createdAtDate = new Date(tx.createdAt * 1000);

          transactions.push({
            id: edge.cursor,
            memo: tx.memo,
            preimage:
              tx.settlementVia.preImage || tx.settlementVia.paymentSecret || "",
            payment_hash: tx.initiationVia.paymentHash || "",
            settled: tx.status === "SUCCESS",
            settleDate: createdAtDate.getTime(),
            totalAmount: absSettlementAmount,
            type: transactionType,
            displayAmount,
          });
        }
      }

      hasNextPage = targetWallet?.transactions.pageInfo.hasNextPage || false;
      lastSeenCursor =
        targetWallet?.transactions.edges.slice(-1)[0]?.cursor || null;

      pageCount++;
    }

    return { data: { transactions } };
  }

  async getBalance(): Promise<GetBalanceResponse> {
    const query = {
      query: `
        query getinfo {
          me {
            defaultAccount {
              wallets {
                id
                balance
                walletCurrency
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

      const targetWallet = data.me.defaultAccount.wallets.find(
        (w: GaloyWallet) => w.id === this.config.walletId
      );
      if (targetWallet) {
        if (targetWallet.walletCurrency !== (this.config.currency || "BTC")) {
          throw new Error(
            "Wallet currency does not match the account currency. " +
              targetWallet.walletCurrency +
              " != " +
              (this.config.currency || "BTC")
          );
        }

        const currency = targetWallet.walletCurrency;
        const balance =
          currency !== "BTC"
            ? this.toFiatFloat(targetWallet.balance, currency)
            : targetWallet.balance;

        return {
          data: {
            balance,
            currency,
          },
        };
      } else {
        throw new Error("Valid wallet not found");
      }
    });
  }

  async sendPayment(args: SendPaymentArgs): Promise<SendPaymentResponse> {
    const query = {
      query: `
        mutation lnInvoicePaymentSend($input: LnInvoicePaymentInput!) {
          lnInvoicePaymentSend(input:$input) {
            status
            errors {
              message
            }
            transaction {
              settlementVia {
                ... on SettlementViaLn {
                  ${
                    this.config.apiCompatibilityMode
                      ? "paymentSecret"
                      : "preImage"
                  }
                }
                ... on SettlementViaIntraLedger {
                  ${
                    this.config.apiCompatibilityMode
                      ? "counterPartyWalletId"
                      : "preImage"
                  }
                }
              }
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

      const transaction = data.lnInvoicePaymentSend.transaction;
      let preimageMessage = "No preimage received";

      if (transaction && transaction.settlementVia) {
        if (
          "preImage" in transaction.settlementVia ||
          "paymentSecret" in transaction.settlementVia
        ) {
          preimageMessage =
            transaction.settlementVia.preImage ||
            transaction.settlementVia.paymentSecret;
        } else if ("counterPartyWalletId" in transaction.settlementVia) {
          preimageMessage = "No preimage, the payment was settled intraledger";
        }
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
              preimage: preimageMessage,
              paymentHash,
              route: { total_amt: amountInSats, total_fees: 0 },
            },
          };
      }
    });
  }

  async checkPayment(args: CheckPaymentArgs): Promise<CheckPaymentResponse> {
    const query = {
      query: `
        query transactionsList($first: Int, $after: String) {
          me {
            defaultAccount {
              wallets {
                id
                walletCurrency
                transactions(first: $first, after: $after) {
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
                          ${
                            this.config.apiCompatibilityMode
                              ? "paymentSecret"
                              : "preImage"
                          }
                        }
                        ... on SettlementViaIntraLedger {
                          ${
                            this.config.apiCompatibilityMode
                              ? "counterPartyWalletId"
                              : "preImage"
                          }
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
    };

    let result: true | CheckPaymentResponse = true;
    while (result === true) {
      result = await this.request(query).then(({ data, errors }) => {
        const errs = errors || data.me.errors;
        if (errs && errs.length) {
          throw new Error(errs[0].message || JSON.stringify(errs));
        }

        const account: GaloyTransactionsAccount = data.me.defaultAccount;
        const wallet = account.wallets.find(
          (w) => w.id === this.config.walletId
        );
        if (wallet === undefined) {
          throw new Error("Bad data received.");
        }
        if (wallet.walletCurrency !== (this.config.currency || "BTC")) {
          throw new Error(
            "Wallet currency does not match the account currency. " +
              wallet.walletCurrency +
              " != " +
              (this.config.currency || "BTC")
          );
        }

        const txEdges = wallet.transactions.edges;
        const tx = txEdges.find(
          (tx) => tx.node.initiationVia.paymentHash === args.paymentHash
        );
        if (tx !== undefined) {
          return {
            data: {
              paid: tx.node.status === "SUCCESS",
              preimage: tx.node.settlementVia.counterPartyWalletId
                ? "Payment executed internally"
                : tx.node.settlementVia.preImage || "No preimage received",
            },
          };
        }

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

  async makeInvoice(args: MakeInvoiceArgs): Promise<MakeInvoiceResponse> {
    const mutationName =
      this.config.currency == "USD" ? "LnUsdInvoiceCreate" : "lnInvoiceCreate";
    const inputTypeName =
      this.config.currency == "USD"
        ? "LnUsdInvoiceCreateInput"
        : "LnInvoiceCreateInput";
    const fun =
      this.config.currency == "USD" ? "lnUsdInvoiceCreate" : "lnInvoiceCreate";
    const currency = this.config.currency || "BTC";

    let amountSats = Number(args.amount);
    if (currency !== "BTC") {
      const rate = await getCurrencyRateWithCache(CURRENCIES[currency]);
      amountSats = this.toFiatInt(amountSats * rate, currency);
    }

    const query = {
      query: `
        mutation ${mutationName}($input: ${inputTypeName}!) {
          ${fun}(input: $input) {
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
          amount: amountSats,
          memo: args.memo,
        },
      },
    };
    return this.request(query).then(({ data, errors }) => {
      const errs = errors || data[fun].errors;
      if (errs && errs.length) {
        throw new Error(errs[0].message || JSON.stringify(errs));
      }

      return {
        data: {
          paymentRequest: data[fun].invoice.paymentRequest,
          rHash: data[fun].invoice.paymentHash,
        },
      };
    });
  }

  async request(query: { query: string }) {
    const reqConfig: AxiosRequestConfig = {
      method: "POST",
      url: this.config.url,
      responseType: "json",
      headers: this.config.headers,
      adapter: fetchAdapter,
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

type Headers = {
  [key: string]: string;
};

type TransactionListVariables = {
  first: number;
  after?: string;
};

type GaloyTransactionsAccount = {
  defaultWalletId: string;
  wallets: GaloyWallet[];
};

type TransactionNode = {
  status: string;
  createdAt: number;
  settlementAmount: number;
  memo: string;
  direction: string;
  initiationVia: {
    paymentHash?: string;
  };
  settlementVia: {
    preImage?: string;
    paymentSecret?: string;
    counterPartyWalletId?: string;
  };
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
      node: TransactionNode;
    }[];
  };
};

export default Galoy;
