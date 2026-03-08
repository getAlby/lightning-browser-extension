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
const enc_base64_1 = __importDefault(require("crypto-js/enc-base64"));
const enc_utf8_1 = __importDefault(require("crypto-js/enc-utf8"));
class Eclair {
    constructor(account, config) {
        this.account = account;
        this.config = config;
    }
    init() {
        return Promise.resolve();
    }
    unload() {
        return Promise.resolve();
    }
    get supportedMethods() {
        return [
            "getInfo",
            "keysend",
            "makeInvoice",
            "sendPayment",
            "sendPaymentAsync",
            "signMessage",
            "getBalance",
        ];
    }
    getInfo() {
        return this.request("/getinfo", undefined).then((data) => {
            return {
                data: {
                    alias: data.alias,
                    pubkey: data.nodeId,
                    color: data.color,
                },
            };
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
        return __awaiter(this, void 0, void 0, function* () {
            console.error(`getTransactions() is not yet supported with the currently used account: ${this.constructor.name}`);
            return { data: { transactions: [] } };
        });
    }
    getBalance() {
        return __awaiter(this, void 0, void 0, function* () {
            const balances = yield this.request("/usablebalances");
            const total = balances
                .map((balance) => balance.canSend || 0)
                .reduce((acc, b) => acc + b, 0);
            return {
                data: {
                    balance: Math.floor(total / 1000),
                },
            };
        });
    }
    sendPayment(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const { paymentHash, paymentPreimage } = yield this.request("/payinvoice", {
                invoice: args.paymentRequest,
                blocking: true,
            });
            const info = yield this.request("/getsentinfo", {
                paymentHash,
            });
            const { status, recipientAmount } = info[info.length - 1];
            return {
                data: {
                    preimage: paymentPreimage,
                    paymentHash,
                    route: {
                        total_amt: Math.floor(recipientAmount / 1000),
                        total_fees: Math.floor(status.feesPaid / 1000),
                    },
                },
            };
        });
    }
    keysend(args) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("not supported");
        });
    }
    checkPayment(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.request("/getreceivedinfo", {
                paymentHash: args.paymentHash,
            });
            return {
                data: {
                    paid: data && data.status.type === "received",
                },
            };
        });
    }
    signMessage(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const { signature } = yield this.request("/signmessage", {
                msg: enc_base64_1.default.stringify(enc_utf8_1.default.parse(args.message)),
            });
            return {
                data: {
                    message: args.message,
                    signature: signature,
                },
            };
        });
    }
    makeInvoice(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield this.request("/createinvoice", {
                description: args.memo,
                amountMsat: +args.amount * 1000,
            });
            return {
                data: {
                    paymentRequest: res.serialized,
                    rHash: res.paymentHash,
                },
            };
        });
    }
    request(path, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = new URL(this.config.url.startsWith("http")
                ? this.config.url
                : "http://" + this.config.url);
            url.pathname = path;
            const headers = new Headers();
            headers.append("Accept", "application/json");
            const password = enc_base64_1.default.stringify(enc_utf8_1.default.parse(":" + this.config.password));
            headers.append("Authorization", "Basic " + password);
            const body = new FormData();
            if (params) {
                for (const k in params) {
                    body.append(k, params[k]);
                }
            }
            const res = yield fetch(url.toString(), {
                method: "POST",
                headers,
                body,
            });
            if (!res.ok) {
                let errBody;
                try {
                    const textBody = yield res.text();
                    try {
                        errBody = JSON.parse(textBody);
                        if (!errBody.error) {
                            throw new Error("error response: " + textBody.slice(0, 200));
                        }
                    }
                    catch (err) {
                        throw new Error("got a non-JSON response: " + textBody.slice(0, 200));
                    }
                }
                catch (err) {
                    throw new Error(res.statusText);
                }
                console.error("eclair error", errBody.error);
                throw new Error(errBody.error);
            }
            return yield res.json();
        });
    }
}
exports.default = Eclair;
