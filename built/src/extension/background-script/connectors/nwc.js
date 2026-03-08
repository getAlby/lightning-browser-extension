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
const sdk_1 = require("@getalby/sdk");
const bolt11_signet_1 = __importDefault(require("bolt11-signet"));
const enc_base64_1 = __importDefault(require("crypto-js/enc-base64"));
const enc_hex_1 = __importDefault(require("crypto-js/enc-hex"));
const enc_utf8_1 = __importDefault(require("crypto-js/enc-utf8"));
const sha256_1 = __importDefault(require("crypto-js/sha256"));
class NWCConnector {
    get supportedMethods() {
        return [
            "getInfo",
            "makeInvoice",
            "sendPayment",
            "sendPaymentAsync",
            "getBalance",
            "keysend",
            "getTransactions",
            "signMessage",
        ];
    }
    constructor(account, config) {
        this.config = config;
        this.nwc = new sdk_1.NWCClient({
            nostrWalletConnectUrl: this.config.nostrWalletConnectUrl,
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve();
        });
    }
    unload() {
        return __awaiter(this, void 0, void 0, function* () {
            this.nwc.close();
        });
    }
    getInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const info = yield this.nwc.getInfo();
            return {
                data: info,
            };
        });
    }
    getBalance() {
        return __awaiter(this, void 0, void 0, function* () {
            const balance = yield this.nwc.getBalance();
            return {
                data: { balance: Math.floor(balance.balance / 1000), currency: "BTC" },
            };
        });
    }
    getTransactions() {
        return __awaiter(this, void 0, void 0, function* () {
            const listTransactionsResponse = yield this.nwc.listTransactions({
                limit: 50,
                unpaid_outgoing: true,
            });
            const transactions = listTransactionsResponse.transactions
                .filter((transaction) => transaction.state !== "accepted") // TODO: add support to display accepted HOLD payments
                .map((transaction, index) => {
                var _a;
                return ({
                    id: `${index}`,
                    memo: transaction.description,
                    preimage: transaction.preimage,
                    payment_hash: transaction.payment_hash,
                    settled: transaction.state == "settled",
                    settleDate: transaction.settled_at * 1000,
                    creationDate: transaction.created_at * 1000,
                    totalAmount: Math.ceil(transaction.amount / 1000),
                    type: transaction.type == "incoming" ? "received" : "sent",
                    custom_records: this.tlvToCustomRecords((_a = transaction.metadata) === null || _a === void 0 ? void 0 : _a["tlv_records"]),
                    state: transaction.state,
                    metadata: transaction.metadata,
                });
            });
            return {
                data: {
                    transactions,
                },
            };
        });
    }
    makeInvoice(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const invoice = yield this.nwc.makeInvoice({
                amount: typeof args.amount === "number"
                    ? args.amount * 1000
                    : parseInt(args.amount) * 1000 || 0,
                description: args.memo,
            });
            return {
                data: {
                    paymentRequest: invoice.invoice,
                    rHash: invoice.payment_hash,
                },
            };
        });
    }
    sendPayment(args) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const invoice = bolt11_signet_1.default.decode(args.paymentRequest);
            const paymentHash = (_a = invoice.tags.find((tag) => tag.tagName === "payment_hash")) === null || _a === void 0 ? void 0 : _a.data;
            if (!paymentHash) {
                throw new Error("Could not find payment hash in invoice");
            }
            const response = yield this.nwc.payInvoice({
                invoice: args.paymentRequest,
            });
            return {
                data: {
                    preimage: response.preimage,
                    paymentHash,
                    route: {
                        // TODO: how to get amount paid for zero-amount invoices?
                        total_amt: Math.floor(parseInt(invoice.millisatoshis || "0") / 1000),
                        // TODO: How to get fees?
                        total_fees: 0,
                    },
                },
            };
        });
    }
    keysend(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.nwc.payKeysend(Object.assign({ pubkey: args.pubkey, amount: args.amount * 1000 }, (args.customRecords && {
                tlv_records: this.customRecordsToTlv(args.customRecords),
            })));
            const paymentHash = (0, sha256_1.default)(data.preimage).toString(enc_hex_1.default);
            return {
                data: {
                    preimage: data.preimage,
                    paymentHash,
                    route: {
                        total_amt: args.amount,
                        // TODO: How to get fees?
                        total_fees: 0,
                    },
                },
            };
        });
    }
    checkPayment(args) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.nwc.lookupInvoice({
                    payment_hash: args.paymentHash,
                });
                return {
                    data: {
                        paid: !!response.settled_at,
                        preimage: response.preimage,
                    },
                };
            }
            catch (error) {
                console.error(error);
                return {
                    data: {
                        paid: false,
                    },
                };
            }
        });
    }
    signMessage(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.nwc.signMessage({ message: args.message });
            return Promise.resolve({
                data: {
                    message: response.message,
                    signature: response.signature,
                },
            });
        });
    }
    connectPeer(args) {
        throw new Error("Method not implemented.");
    }
    customRecordsToTlv(customRecords) {
        return Object.entries(customRecords).map(([key, value]) => ({
            type: parseInt(key),
            value: enc_utf8_1.default.parse(value).toString(enc_hex_1.default),
        }));
    }
    tlvToCustomRecords(tlvRecords) {
        if (!tlvRecords) {
            return undefined;
        }
        const customRecords = {};
        for (const tlv of tlvRecords) {
            // TODO: ConnectorTransaction["custom_records"] should not be in base64 format
            // as this requires unnecessary re-encoding
            customRecords[tlv.type.toString()] = enc_hex_1.default.parse(tlv.value).toString(enc_base64_1.default);
        }
        return customRecords;
    }
}
exports.default = NWCConnector;
