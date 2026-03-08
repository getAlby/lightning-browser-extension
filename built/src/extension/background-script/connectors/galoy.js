"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const bolt11_signet_1 = __importDefault(require("bolt11-signet"));
const constants_1 = require("~/common/constants");
const paymentRequest_1 = require("~/common/utils/paymentRequest");
const getCurrencyRate_1 = require("~/extension/background-script/actions/cache/getCurrencyRate");
class Galoy {
    constructor(account, config) {
        this.account = account;
        // assuming that if there is an accessToken left over, headers are not stored
        const accessToken = config.accessToken;
        this.config = Object.assign(Object.assign({}, config), { headers: config.headers || this.getLegacyHeaders(accessToken || ""), apiCompatibilityMode: config.apiCompatibilityMode !== undefined
                ? config.apiCompatibilityMode
                : true, currency: config.currency || "BTC" });
    }
    getLegacyHeaders(accessToken) {
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
    toFiatCents(amount) {
        return Math.round(amount * 100);
    }
    fromFiatCents(amount) {
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
    getInfo() {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    // not yet implemented
    connectPeer() {
        return __awaiter(this, void 0, void 0, function* () {
            console.error(`${this.constructor.name} does not implement the getInvoices call`);
            throw new Error("Not yet supported with the currently used account.");
        });
    }
    getTransactions() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const transactionsPerPage = 20;
            let pageCount = 0;
            let lastSeenCursor = null;
            let hasNextPage = true;
            const transactions = [];
            // list a maximum of 5 pages of transactions
            while (hasNextPage && pageCount < 5) {
                const variablesObj = {
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
                            paymentRequest
                            paymentHash
                          }
                        }
                        settlementVia {
                          ... on SettlementViaLn {
                            ${this.config.apiCompatibilityMode
                        ? "paymentSecret"
                        : "preImage"}
                          }
                          ... on SettlementViaIntraLedger {
                            ${this.config.apiCompatibilityMode
                        ? "counterPartyWalletId"
                        : "preImage"}
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
                const response = yield this.request(query);
                const errs = response.errors || response.data.me.errors;
                if (errs && errs.length) {
                    throw new Error(errs[0].message || JSON.stringify(errs));
                }
                const wallets = response.data.me.defaultAccount.wallets;
                const targetWallet = wallets.find((w) => w.id === this.config.walletId);
                if (targetWallet) {
                    if (targetWallet.walletCurrency !== this.config.currency) {
                        throw new Error("Wallet currency does not match the account currency. " +
                            targetWallet.walletCurrency +
                            " != " +
                            this.config.currency);
                    }
                    for (const edge of targetWallet.transactions.edges) {
                        const tx = edge.node;
                        // Determine transaction type based on the direction field
                        const transactionType = tx.direction === "RECEIVE" ? "received" : "sent";
                        const currency = targetWallet.walletCurrency;
                        // Do not display a double negative if sent
                        let absSettlementAmount = Math.abs(tx.settlementAmount);
                        let displayAmount = undefined;
                        if (currency !== "BTC") {
                            const rate = yield (0, getCurrencyRate_1.getCurrencyRateWithCache)(constants_1.CURRENCIES[currency]);
                            absSettlementAmount = this.fromFiatCents(absSettlementAmount);
                            displayAmount = [absSettlementAmount, constants_1.CURRENCIES[currency]];
                            absSettlementAmount = Math.ceil(absSettlementAmount / rate);
                        }
                        const createdAtDate = new Date(tx.createdAt * 1000);
                        let paymentRequestDescription = "";
                        if (!tx.memo && tx.initiationVia.paymentRequest) {
                            paymentRequestDescription = (0, paymentRequest_1.getPaymentRequestDescription)(tx.initiationVia.paymentRequest);
                        }
                        const transaction = {
                            id: edge.cursor,
                            memo: tx.memo || paymentRequestDescription,
                            preimage: tx.settlementVia.preImage || tx.settlementVia.paymentSecret || "",
                            payment_hash: tx.initiationVia.paymentHash || "",
                            settled: tx.status === "SUCCESS",
                            settleDate: createdAtDate.getTime(),
                            creationDate: createdAtDate.getTime(),
                            totalAmount: absSettlementAmount,
                            type: transactionType,
                            displayAmount,
                        };
                        if (transaction.settled) {
                            transactions.push(transaction);
                        }
                    }
                }
                hasNextPage = (targetWallet === null || targetWallet === void 0 ? void 0 : targetWallet.transactions.pageInfo.hasNextPage) || false;
                lastSeenCursor =
                    ((_a = targetWallet === null || targetWallet === void 0 ? void 0 : targetWallet.transactions.edges.slice(-1)[0]) === null || _a === void 0 ? void 0 : _a.cursor) || null;
                pageCount++;
            }
            return { data: { transactions } };
        });
    }
    getBalance() {
        return __awaiter(this, void 0, void 0, function* () {
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
                const targetWallet = data.me.defaultAccount.wallets.find((w) => w.id === this.config.walletId);
                if (targetWallet) {
                    if (targetWallet.walletCurrency !== this.config.currency) {
                        throw new Error("Wallet currency does not match the account currency. " +
                            targetWallet.walletCurrency +
                            " != " +
                            this.config.currency);
                    }
                    const currency = targetWallet.walletCurrency;
                    const balance = currency !== "BTC"
                        ? this.fromFiatCents(targetWallet.balance)
                        : targetWallet.balance;
                    return {
                        data: {
                            balance,
                            currency,
                        },
                    };
                }
                else {
                    throw new Error("Valid wallet not found");
                }
            });
        });
    }
    sendPayment(args) {
        return __awaiter(this, void 0, void 0, function* () {
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
                  ${this.config.apiCompatibilityMode
                    ? "paymentSecret"
                    : "preImage"}
                }
                ... on SettlementViaIntraLedger {
                  ${this.config.apiCompatibilityMode
                    ? "counterPartyWalletId"
                    : "preImage"}
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
            const paymentRequestDetails = bolt11_signet_1.default.decode(args.paymentRequest);
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
                    if ("preImage" in transaction.settlementVia ||
                        "paymentSecret" in transaction.settlementVia) {
                        preimageMessage =
                            transaction.settlementVia.preImage ||
                                transaction.settlementVia.paymentSecret;
                    }
                    else if ("counterPartyWalletId" in transaction.settlementVia) {
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
        });
    }
    checkPayment(args) {
        return __awaiter(this, void 0, void 0, function* () {
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
                          ${this.config.apiCompatibilityMode
                    ? "paymentSecret"
                    : "preImage"}
                        }
                        ... on SettlementViaIntraLedger {
                          ${this.config.apiCompatibilityMode
                    ? "counterPartyWalletId"
                    : "preImage"}
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
            let result = true;
            while (result === true) {
                result = yield this.request(query).then(({ data, errors }) => {
                    const errs = errors || data.me.errors;
                    if (errs && errs.length) {
                        throw new Error(errs[0].message || JSON.stringify(errs));
                    }
                    const account = data.me.defaultAccount;
                    const wallet = account.wallets.find((w) => w.id === this.config.walletId);
                    if (wallet === undefined) {
                        throw new Error("Bad data received.");
                    }
                    if (wallet.walletCurrency !== this.config.currency) {
                        throw new Error("Wallet currency does not match the account currency. " +
                            wallet.walletCurrency +
                            " != " +
                            this.config.currency);
                    }
                    const txEdges = wallet.transactions.edges;
                    const tx = txEdges.find((tx) => tx.node.initiationVia.paymentHash === args.paymentHash);
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
        });
    }
    keysend(args) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("not supported");
        });
    }
    signMessage(args) {
        return Promise.reject(new Error("Not yet supported with Galoy."));
    }
    makeInvoice(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const isUSD = this.config.currency == "USD";
            const mutationName = isUSD
                ? "LnUsdInvoiceBtcDenominatedCreateOnBehalfOfRecipient"
                : "LnInvoiceCreate";
            const inputTypeName = isUSD
                ? "LnUsdInvoiceBtcDenominatedCreateOnBehalfOfRecipientInput"
                : "LnInvoiceCreateInput";
            const invoiceCreateFunction = isUSD
                ? "lnUsdInvoiceBtcDenominatedCreateOnBehalfOfRecipient"
                : "lnInvoiceCreate";
            const amountSats = Number(args.amount);
            const query = {
                query: `
        mutation ${mutationName}($input: ${inputTypeName}!) {
          ${invoiceCreateFunction}(input: $input) {
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
                        walletId: !isUSD ? this.config.walletId : undefined,
                        recipientWalletId: isUSD ? this.config.walletId : undefined,
                        amount: amountSats,
                        memo: args.memo,
                    },
                },
            };
            return this.request(query).then(({ data, errors }) => {
                const errs = errors || data[invoiceCreateFunction].errors;
                if (errs && errs.length) {
                    throw new Error(errs[0].message || JSON.stringify(errs));
                }
                return {
                    data: {
                        paymentRequest: data[invoiceCreateFunction].invoice.paymentRequest,
                        rHash: data[invoiceCreateFunction].invoice.paymentHash,
                    },
                };
            });
        });
    }
    request(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const reqConfig = {
                method: "POST",
                url: this.config.url,
                responseType: "json",
                headers: this.config.headers,
                adapter: "fetch",
            };
            reqConfig.data = query;
            let data;
            try {
                const res = yield (0, axios_1.default)(reqConfig);
                data = res.data;
            }
            catch (e) {
                console.error(e);
                if (e instanceof Error)
                    throw new Error(e.message);
            }
            return data;
        });
    }
}
exports.default = Galoy;
