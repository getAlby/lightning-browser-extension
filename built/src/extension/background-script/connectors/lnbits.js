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
const bolt11_signet_1 = __importDefault(require("bolt11-signet"));
const enc_hex_1 = __importDefault(require("crypto-js/enc-hex"));
const sha256_1 = __importDefault(require("crypto-js/sha256"));
const signer_1 = __importDefault(require("~/common/utils/signer"));
class LnBits {
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
            "makeInvoice",
            "sendPayment",
            "sendPaymentAsync",
            "signMessage",
            "getBalance",
        ];
    }
    getInfo() {
        return this.request("GET", "/api/v1/wallet", this.config.adminkey, undefined).then((data) => {
            return {
                data: {
                    alias: data.name,
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
    /*
    LNBits Swagger Docs: https://legend.lnbits.org/devs/swagger.html#/default/api_payments_api_v1_payments_get
    Sample Response:
      [
        {
          "checking_id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
          "pending": false,
          "amount": 2000,
          "fee": 0,
          "memo": "LNbits",
          "time": 1000000000,
          "bolt11-signet": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
          "preimage": "0000000000000000000000000000000000000000000000000000000000000000",
          "payment_hash": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
          "extra": {},
          "wallet_id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
          "webhook": null,
          "webhook_status": null
        }
      ]
    */
    getTransactions() {
        return this.request("GET", "/api/v1/payments", this.config.adminkey, undefined).then((data) => {
            const transactions = data
                .map((transaction, index) => {
                const decoded = bolt11_signet_1.default.decode(transaction.bolt11);
                const creationDate = decoded.timestamp
                    ? decoded.timestamp * 1000
                    : new Date(0).getTime();
                return {
                    id: `${transaction.checking_id}-${index}`,
                    memo: transaction.memo,
                    preimage: transaction.preimage !=
                        "0000000000000000000000000000000000000000000000000000000000000000"
                        ? transaction.preimage
                        : "",
                    payment_hash: transaction.payment_hash,
                    settled: !transaction.pending,
                    settleDate: transaction.time * 1000,
                    creationDate: creationDate,
                    totalAmount: Math.ceil(Math.abs(transaction.amount / 1000)),
                    type: transaction.amount > 0 ? "received" : "sent",
                };
            })
                .filter((transaction) => transaction.settled);
            return {
                data: {
                    transactions,
                },
            };
        });
    }
    getBalance() {
        return this.request("GET", "/api/v1/wallet", this.config.adminkey, undefined).then((data) => {
            const balanceInSats = Math.floor(data.balance / 1000);
            return {
                data: {
                    balance: balanceInSats,
                },
            };
        });
    }
    sendPayment(args) {
        const paymentRequestDetails = bolt11_signet_1.default.decode(args.paymentRequest);
        const amountInSats = paymentRequestDetails.satoshis || 0;
        return this.request("POST", "/api/v1/payments", this.config.adminkey, {
            bolt11: args.paymentRequest,
            out: true,
        }).then((data) => {
            // TODO: how do we get the total amount here??
            return this.checkPayment({ paymentHash: data.payment_hash }).then(({ data: checkData }) => {
                return {
                    data: {
                        preimage: (checkData === null || checkData === void 0 ? void 0 : checkData.preimage) || "",
                        paymentHash: data.payment_hash,
                        route: { total_amt: amountInSats, total_fees: 0 },
                    },
                };
            });
        });
    }
    keysend(args) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("not supported");
        });
    }
    checkPayment(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.request("GET", `/api/v1/payments/${args.paymentHash}`, this.config.adminkey);
            return {
                data: Object.assign({ paid: data.isPaid }, data),
            };
        });
    }
    signMessage(args) {
        // make sure we got the config to create a new key
        if (!this.config.url || !this.config.adminkey) {
            return Promise.reject(new Error("Missing config"));
        }
        if (!args.message) {
            return Promise.reject(new Error("Invalid message"));
        }
        const message = (0, sha256_1.default)(args.message).toString(enc_hex_1.default);
        // create a signing key from the lnbits adminkey
        const keyHex = (0, sha256_1.default)(`lnbits://${this.config.adminkey}`).toString(enc_hex_1.default);
        if (!keyHex) {
            return Promise.reject(new Error("Could not create key"));
        }
        const signer = new signer_1.default(keyHex);
        const signedMessageDERHex = signer.sign(message).toDER("hex");
        // make sure we got some signed message
        if (!signedMessageDERHex) {
            return Promise.reject(new Error("Signing failed"));
        }
        return Promise.resolve({
            data: {
                message: args.message,
                signature: signedMessageDERHex,
            },
        });
    }
    makeInvoice(args) {
        return this.request("POST", "/api/v1/payments", this.config.adminkey, {
            amount: args.amount,
            unit: "sat",
            memo: args.memo,
            out: false,
        }).then((data) => {
            return {
                data: {
                    paymentRequest: data.bolt11 || data.payment_request,
                    rHash: data.payment_hash,
                },
            };
        });
    }
    request(method, path, apiKey, args) {
        return __awaiter(this, void 0, void 0, function* () {
            let body = null;
            let query = "";
            const headers = new Headers();
            headers.append("Accept", "application/json");
            headers.append("Content-Type", "application/json");
            headers.append("X-Api-Key", apiKey);
            if (method === "POST") {
                body = JSON.stringify(args);
            }
            else if (args !== undefined) {
                query = `?`; //`?${stringify(args)}`;
            }
            const res = yield fetch(this.config.url + path + query, {
                method,
                headers,
                body,
            });
            if (!res.ok) {
                const errBody = yield res.json();
                console.error("errBody", errBody);
                throw new Error(errBody.detail);
            }
            return yield res.json();
        });
    }
}
exports.default = LnBits;
