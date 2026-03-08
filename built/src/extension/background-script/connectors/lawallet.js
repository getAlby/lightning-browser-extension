"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.signEvent = exports.finishEvent = exports.makeZapRequest = exports.parseTransaction = exports.HttpError = void 0;
const secp256k1_1 = require("@noble/curves/secp256k1");
const secp256k1 = __importStar(require("@noble/secp256k1"));
const bolt11_signet_1 = __importDefault(require("bolt11-signet"));
const enc_hex_1 = __importDefault(require("crypto-js/enc-hex"));
const sha256_1 = __importDefault(require("crypto-js/sha256"));
const nostr_tools_1 = require("nostr-tools");
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const helpers_1 = require("~/extension/background-script/actions/nostr/helpers");
const nostr_1 = __importDefault(require("~/extension/background-script/nostr"));
class HttpError extends Error {
    constructor(status, message, error) {
        super(message);
        this.status = status;
        this.error = error;
    }
}
exports.HttpError = HttpError;
class LaWallet {
    constructor(account, config) {
        this.invoices_paid = {};
        this.last_invoice_check = 0;
        this.account = account;
        this.config = config;
        this.public_key = new nostr_1.default(config.privateKey).getPublicKey();
        this.relay = (0, nostr_tools_1.relayInit)(config.relayUrl);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve();
        });
    }
    unload() {
        this.relay.close();
        return Promise.resolve();
    }
    get supportedMethods() {
        return [
            "getInfo",
            "makeInvoice",
            "sendPayment",
            "signMessage",
            "getBalance",
            "getTransactions",
        ];
    }
    connectPeer() {
        return __awaiter(this, void 0, void 0, function* () {
            console.error(`${this.constructor.name} does not implement the getInvoices call`);
            throw new Error("Not yet supported with the currently used account.");
        });
    }
    getTransactions() {
        return __awaiter(this, void 0, void 0, function* () {
            const _transactions = yield LaWallet.request(this.config.apiEndpoint, "POST", "/nostr/fetch", {
                authors: [this.config.ledgerPublicKey, this.config.urlxPublicKey],
                kinds: [1112],
                since: 0,
                "#t": ["internal-transaction-ok", "inbound-transaction-start"],
                "#p": [this.public_key],
            });
            const transactions = _transactions
                .map((event) => {
                return Object.assign(Object.assign({}, event), { kind: event.kind });
            })
                .sort((a, b) => b.created_at - a.created_at);
            const parsedTransactions = yield Promise.all(transactions.map(parseTransaction.bind(this, this.public_key, this.config.privateKey)));
            return {
                data: {
                    transactions: parsedTransactions.filter((transaction) => transaction.settled),
                },
            };
        });
    }
    getInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, nodeAlias } = yield LaWallet.request(this.config.identityEndpoint, "GET", `/api/pubkey/${this.public_key}`, undefined);
            const domain = this.config.identityEndpoint.replace("https://", "");
            return {
                data: {
                    alias: nodeAlias || domain,
                    pubkey: this.public_key,
                    lightning_address: `${username}@${domain}`,
                },
            };
        });
    }
    getBalance() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const filter = {
                authors: [this.config.ledgerPublicKey],
                kinds: [31111],
                "#d": [`balance:BTC:${this.public_key}`],
            };
            const events = yield LaWallet.request(this.config.apiEndpoint, "POST", "/nostr/fetch", filter);
            const balanceEvent = events[0];
            return {
                data: {
                    balance: balanceEvent
                        ? parseInt((_a = balanceEvent === null || balanceEvent === void 0 ? void 0 : balanceEvent.tags.find((tag) => tag[0] === "amount")) === null || _a === void 0 ? void 0 : _a[1]) / 1000
                        : 0,
                },
            };
        });
    }
    sendPayment(args) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const paymentRequestDetails = bolt11_signet_1.default.decode(args.paymentRequest);
            const unsignedEvent = {
                kind: 1112,
                created_at: Math.floor(Date.now() / 1000),
                tags: [
                    ["t", "internal-transaction-start"],
                    ["p", this.config.ledgerPublicKey],
                    ["p", this.config.urlxPublicKey],
                    ["bolt11", args.paymentRequest],
                ],
                content: JSON.stringify({
                    tokens: { BTC: (_a = paymentRequestDetails.millisatoshis) === null || _a === void 0 ? void 0 : _a.toString() },
                }),
            };
            const event = finishEvent(unsignedEvent, this.config.privateKey);
            try {
                yield LaWallet.request(this.config.apiEndpoint, "POST", "/nostr/publish", event, "blob");
                this.relay.connect();
                return this.getPaymentStatus(event);
            }
            catch (e) {
                console.error(e);
                if (e instanceof Error)
                    Toast_1.default.error(`${e.message}`);
                throw e;
            }
        });
    }
    keysend(args) {
        return __awaiter(this, void 0, void 0, function* () {
            console.error(`${this.constructor.name} does not implement the keysend call`);
            throw new Error("Keysend not yet supported.");
        });
    }
    onZapReceipt(event) {
        var _a;
        const pr = (_a = event.tags.find((tag) => tag[0] === "bolt11")) === null || _a === void 0 ? void 0 : _a[1];
        const paymentHash = bolt11_signet_1.default.decode(pr).tagsObject.payment_hash;
        this.invoices_paid[paymentHash] = true;
    }
    getPaymentStatus(event) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const paymentRequestDetails = bolt11_signet_1.default.decode((_a = event.tags.find((tag) => tag[0] === "bolt11")) === null || _a === void 0 ? void 0 : _a[1]);
            const amountInSats = paymentRequestDetails.satoshis || 0;
            const payment_route = { total_amt: amountInSats, total_fees: 0 };
            yield this.relay.connect();
            return new Promise((resolve, reject) => {
                const sub = this.relay.sub([
                    {
                        authors: [this.config.ledgerPublicKey, this.config.urlxPublicKey],
                        "#e": [event.id],
                        "#t": [
                            "internal-transaction-error",
                            "internal-transaction-ok",
                            "outbound-transaction-start",
                        ],
                    },
                ]);
                sub.on("event", (event) => __awaiter(this, void 0, void 0, function* () {
                    const tag = event.tags.find((tag) => tag[0] === "t")[1];
                    const content = JSON.parse(event.content);
                    switch (tag) {
                        case "internal-transaction-ok": // Refund
                            if (event.tags[1][1] === this.public_key && !!content.memo) {
                                return reject(new Error(content.memo));
                            }
                            break;
                        case "internal-transaction-error": // No funds or ledger error
                            return reject(new Error(content.messages[0]));
                        case "outbound-transaction-start": // Payment done
                            return resolve({
                                data: {
                                    preimage: yield extractPreimage(event, this.config.privateKey),
                                    paymentHash: paymentRequestDetails.tagsObject.payment_hash,
                                    route: payment_route,
                                },
                            });
                    }
                }));
            });
        });
    }
    checkPayment(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const zapReceipts = yield this.getZapReceipts(10, this.last_invoice_check);
            zapReceipts.forEach(this.onZapReceipt.bind(this));
            return {
                data: {
                    paid: !!this.invoices_paid[args.paymentHash],
                },
            };
        });
    }
    signMessage(args) {
        if (!this.config.apiEndpoint || !this.config.privateKey) {
            return Promise.reject(new Error("Missing config"));
        }
        if (!args.message) {
            return Promise.reject(new Error("Invalid message"));
        }
        return Promise.resolve({
            data: {
                message: args.message,
                signature: secp256k1_1.schnorr
                    .sign((0, sha256_1.default)(args.message).toString(enc_hex_1.default), this.config.privateKey)
                    .toString(),
            },
        });
    }
    makeInvoice(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const unsignedZapEvent = makeZapRequest({
                profile: this.public_key,
                event: null,
                amount: args.amount * 1000,
                comment: args.memo,
                relays: this.config.relayList,
            });
            const zapEvent = finishEvent(unsignedZapEvent, this.config.privateKey);
            const params = {
                amount: String(args.amount * 1000),
                comment: args.memo,
                nostr: JSON.stringify(zapEvent),
                lnurl: this.public_key,
            };
            const url = `/lnurlp/${this.public_key}/callback?${new URLSearchParams(params)}`;
            const data = yield LaWallet.request(this.config.apiEndpoint, "GET", url);
            const paymentRequestDetails = bolt11_signet_1.default.decode(data.pr);
            this.last_invoice_check = Math.floor(Date.now() / 1000);
            return {
                data: {
                    paymentRequest: data.pr,
                    rHash: paymentRequestDetails.tagsObject.payment_hash,
                },
            };
        });
    }
    getZapReceipts(limit = 10, since = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = {
                authors: [this.config.urlxPublicKey],
                kinds: [9735],
                since,
                limit,
                "#p": [this.public_key],
            };
            const zapEvents = yield LaWallet.request(this.config.apiEndpoint, "POST", "/nostr/fetch", filter);
            return zapEvents;
        });
    }
    // Static Methods
    /**
     *
     * @param url The URL to fetch data from.
     * @param method HTTP Method
     * @param path API path
     * @param args POST arguments
     * @param responseType
     * @returns
     * @throws {HttpError} When the response has an HTTP error status.
     */
    static request(url, method, path, args = {}, responseType = "json") {
        return __awaiter(this, void 0, void 0, function* () {
            const headers = new Headers();
            headers.append("Accept", "application/json");
            headers.append("Content-Type", "application/json");
            let body = null;
            let res = null;
            if (method !== "GET") {
                body = JSON.stringify(args);
            }
            try {
                res = yield fetch(`${url}${path}`, {
                    headers,
                    method,
                    body,
                });
            }
            catch (e) {
                throw new HttpError(0, "Network error", e);
            }
            if (!res.ok) {
                throw new HttpError(res.status, yield res.text());
            }
            return yield (responseType === "json" ? res.json() : res.text());
        });
    }
}
exports.default = LaWallet;
/** Utils Functions **/
function extractPreimage(event, privateKey) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const encrypted = (_a = event.tags.find((tag) => tag[0] === "preimage")) === null || _a === void 0 ? void 0 : _a[1];
            const messageKeyHex = yield nostr_tools_1.nip04.decrypt(privateKey, event.pubkey, encrypted);
            return messageKeyHex;
        }
        catch (e) {
            return "";
        }
    });
}
function parseTransaction(userPubkey, privateKey, event) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const content = JSON.parse(event.content);
        // Get bolt11 tag
        const bolt11 = (_a = event.tags.find((tag) => tag[0] === "bolt11")) === null || _a === void 0 ? void 0 : _a[1];
        let paymentHash = event.id;
        let memo = content.memo || "";
        // Check if the event is a payment request
        if (bolt11) {
            const paymentRequestDetails = bolt11_signet_1.default.decode(bolt11);
            paymentHash = paymentRequestDetails.tagsObject.payment_hash;
            memo = paymentRequestDetails.tagsObject.description || memo;
        }
        return {
            id: event.id,
            preimage: yield extractPreimage(event, privateKey),
            settled: true,
            settleDate: event.created_at * 1000,
            creationDate: event.created_at * 1000,
            totalAmount: content.tokens.BTC / 1000,
            type: event.tags[1][1] === userPubkey ? "received" : "sent",
            custom_records: {},
            memo: memo,
            payment_hash: paymentHash,
        };
    });
}
exports.parseTransaction = parseTransaction;
function makeZapRequest({ profile, event, amount, relays = ["wss://relay.lawallet.ar"], comment = "", }) {
    if (!amount)
        throw new Error("amount not given");
    if (!profile)
        throw new Error("profile not given");
    const zr = {
        kind: 9734,
        created_at: Math.round(Date.now() / 1000),
        content: comment,
        tags: [
            ["p", profile],
            ["amount", String(amount)],
            ["relays", ...relays],
        ],
    };
    if (event) {
        zr.tags.push(["e", event]);
    }
    return zr;
}
exports.makeZapRequest = makeZapRequest;
function finishEvent(event, privateKey) {
    event.pubkey = new nostr_1.default(privateKey).getPublicKey();
    event.id = (0, helpers_1.getEventHash)(event);
    event.sig = signEvent(event, privateKey);
    return event;
}
exports.finishEvent = finishEvent;
function signEvent(event, key) {
    const signedEvent = secp256k1_1.schnorr.sign((0, helpers_1.getEventHash)(event), key);
    return secp256k1.etc.bytesToHex(signedEvent);
}
exports.signEvent = signEvent;
