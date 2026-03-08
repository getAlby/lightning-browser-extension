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
const enc_base64_1 = __importDefault(require("crypto-js/enc-base64"));
const enc_hex_1 = __importDefault(require("crypto-js/enc-hex"));
const hmac_sha256_1 = __importDefault(require("crypto-js/hmac-sha256"));
const sha256_1 = __importDefault(require("crypto-js/sha256"));
const signer_1 = __importDefault(require("~/common/utils/signer"));
const helpers_1 = require("~/common/utils/helpers");
const HMAC_VERIFY_HEADER_KEY = process.env.HMAC_VERIFY_HEADER_KEY || "alby-extension"; // default is mainly that TS is happy
const defaultHeaders = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-User-Agent": "alby-extension",
};
class LndHub {
    constructor(account, config) {
        this.account = account;
        this.config = config;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.authorize();
        });
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
    // not yet implemented
    connectPeer() {
        return __awaiter(this, void 0, void 0, function* () {
            console.error(`${this.constructor.name} does not implement the getInvoices call`);
            throw new Error("Not yet supported with the currently used account.");
        });
    }
    getInvoices() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.request("GET", "/getuserinvoices", undefined);
            data.sort((a, b) => b.timestamp - a.timestamp);
            const invoices = data.map((invoice, index) => ({
                custom_records: invoice.custom_records,
                id: `${invoice.payment_request}-${index}`,
                memo: invoice.description,
                preimage: "",
                payment_hash: invoice.payment_hash,
                settled: invoice.ispaid,
                settleDate: invoice.timestamp * 1000,
                creationDate: invoice.timestamp * 1000,
                totalAmount: invoice.amt,
                type: "received",
            }));
            return invoices;
        });
    }
    getTransactions() {
        return __awaiter(this, void 0, void 0, function* () {
            const incomingInvoices = yield this.getInvoices();
            const outgoingInvoices = yield this.getPayments();
            const transactions = (0, helpers_1.mergeTransactions)(incomingInvoices, outgoingInvoices).filter((transaction) => transaction.settled);
            return {
                data: {
                    transactions,
                },
            };
        });
    }
    getPayments() {
        return __awaiter(this, void 0, void 0, function* () {
            const lndhubPayments = yield this.request("GET", "/gettxs", { limit: 100 });
            // gettxs endpoint returns successfull outgoing  transactions by default
            const payments = lndhubPayments.map((transaction, index) => ({
                id: `${index}`,
                memo: transaction.memo,
                custom_records: transaction.custom_records,
                preimage: transaction.payment_preimage,
                payment_hash: Buffer.from(transaction.payment_hash.data).toString("hex"),
                settled: true,
                settleDate: transaction.timestamp * 1000,
                creationDate: transaction.timestamp * 1000,
                totalAmount: transaction.value,
                type: "sent",
            }));
            return payments;
        });
    }
    getInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const { alias } = yield this.request("GET", "/getinfo", undefined);
            return {
                data: {
                    alias,
                },
            };
        });
    }
    getBalance() {
        return __awaiter(this, void 0, void 0, function* () {
            const { BTC } = yield this.request("GET", "/balance", undefined);
            return {
                data: {
                    balance: BTC.AvailableBalance,
                },
            };
        });
    }
    sendPayment(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.request("POST", "/payinvoice", {
                invoice: args.paymentRequest,
            });
            if (data.error) {
                throw new Error(data.message);
            }
            if (data.payment_error) {
                throw new Error(data.payment_error);
            }
            if (typeof data.payment_hash === "object" &&
                data.payment_hash.type === "Buffer") {
                data.payment_hash = Buffer.from(data.payment_hash.data).toString("hex");
            }
            if (typeof data.payment_preimage === "object" &&
                data.payment_preimage.type === "Buffer") {
                data.payment_preimage = Buffer.from(data.payment_preimage.data).toString("hex");
            }
            // HACK!
            // some Lnbits extension that implement the LNDHub API do not return the route information.
            // to somewhat work around this we set a payment route and use the amount from the payment request.
            // lnbits needs to fix this and return proper route information with a total amount and fees
            if (!data.payment_route) {
                const paymentRequestDetails = bolt11_signet_1.default.decode(args.paymentRequest);
                const amountInSats = paymentRequestDetails.satoshis || 0;
                data.payment_route = { total_amt: amountInSats, total_fees: 0 };
            }
            return {
                data: {
                    preimage: data.payment_preimage,
                    paymentHash: data.payment_hash,
                    route: data.payment_route,
                },
            };
        });
    }
    keysend(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.request("POST", "/keysend", {
                destination: args.pubkey,
                amount: args.amount,
                customRecords: args.customRecords,
            });
            if (data.error) {
                throw new Error(data.message);
            }
            if (data.payment_error) {
                throw new Error(data.payment_error);
            }
            if (typeof data.payment_hash === "object" &&
                data.payment_hash.type === "Buffer") {
                data.payment_hash = Buffer.from(data.payment_hash.data).toString("hex");
            }
            if (typeof data.payment_preimage === "object" &&
                data.payment_preimage.type === "Buffer") {
                data.payment_preimage = Buffer.from(data.payment_preimage.data).toString("hex");
            }
            return {
                data: {
                    preimage: data.payment_preimage,
                    paymentHash: data.payment_hash,
                    route: data.payment_route,
                },
            };
        });
    }
    checkPayment(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const { paid } = yield this.request("GET", `/checkpayment/${args.paymentHash}`, undefined);
            return {
                data: {
                    paid,
                },
            };
        });
    }
    signMessage(args) {
        // make sure we got the config to create a new key
        if (!this.config.url || !this.config.login || !this.config.password) {
            return Promise.reject(new Error("Missing config"));
        }
        if (!args.message) {
            return Promise.reject(new Error("Invalid message"));
        }
        const message = (0, sha256_1.default)(args.message).toString(enc_hex_1.default);
        const keyHex = (0, sha256_1.default)(`lndhub://${this.config.login}:${this.config.password}`).toString(enc_hex_1.default);
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
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.request("POST", "/addinvoice", {
                amt: args.amount,
                memo: args.memo,
            });
            if (typeof data.r_hash === "object" && data.r_hash.type === "Buffer") {
                data.r_hash = Buffer.from(data.r_hash.data).toString("hex");
            }
            return {
                data: {
                    paymentRequest: data.payment_request,
                    rHash: data.r_hash,
                },
            };
        });
    }
    authorize() {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.config.url}/auth?type=auth`;
            try {
                const { data: authData } = yield axios_1.default.post(url, {
                    login: this.config.login,
                    password: this.config.password,
                }, {
                    headers: Object.assign(Object.assign({}, defaultHeaders), { "X-TS": Math.floor(Date.now() / 1000), "X-VERIFY": this.generateHmacVerification(url) }),
                    adapter: "fetch",
                });
                if (authData.error || authData.errors) {
                    const error = authData.error || authData.errors;
                    const errMessage = ((_b = (_a = error === null || error === void 0 ? void 0 : error.errors) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || ((_c = error === null || error === void 0 ? void 0 : error[0]) === null || _c === void 0 ? void 0 : _c.message);
                    throw new Error(errMessage);
                }
                this.refresh_token = authData.refresh_token;
                this.access_token = authData.access_token;
                this.refresh_token_created = +new Date();
                this.access_token_created = +new Date();
                return authData;
            }
            catch (e) {
                let error = "";
                if (axios_1.default.isAxiosError(e)) {
                    const data = (_d = e.response) === null || _d === void 0 ? void 0 : _d.data;
                    error = (data === null || data === void 0 ? void 0 : data.reason) || (data === null || data === void 0 ? void 0 : data.message) || e.message;
                }
                else if (e instanceof Error) {
                    error = e.message;
                }
                throw new Error(`API error (${this.config.url}) ${error}`);
            }
        });
    }
    generateHmacVerification(uri) {
        const mac = (0, hmac_sha256_1.default)(uri, HMAC_VERIFY_HEADER_KEY).toString(enc_base64_1.default);
        return encodeURIComponent(mac);
    }
    request(method, path, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.access_token) {
                yield this.authorize();
            }
            const url = `${this.config.url}${path}`;
            const reqConfig = {
                method,
                url: url,
                responseType: "json",
                headers: Object.assign(Object.assign({}, defaultHeaders), { Authorization: `Bearer ${this.access_token}`, "X-TS": Math.floor(Date.now() / 1000), "X-VERIFY": this.generateHmacVerification(url) }),
                adapter: "fetch",
            };
            if (method === "POST") {
                reqConfig.data = args;
            }
            else if (args !== undefined) {
                reqConfig.params = args;
            }
            let data;
            try {
                const res = yield (0, axios_1.default)(reqConfig);
                data = res.data;
            }
            catch (e) {
                console.error(e);
                if (axios_1.default.isAxiosError(e)) {
                    const errResponse = e.response;
                    if ((errResponse === null || errResponse === void 0 ? void 0 : errResponse.status) === 404) {
                        const method = path.replace("/", "");
                        throw new Error(`${method} not supported by the connected account.`);
                    }
                    if ((errResponse === null || errResponse === void 0 ? void 0 : errResponse.status) === 401) {
                        try {
                            yield this.authorize();
                        }
                        catch (e) {
                            console.error(e);
                            if (e instanceof Error)
                                throw new Error(e.message);
                        }
                        return this.request(method, path, args);
                    }
                    const errorMessage = `${errResponse === null || errResponse === void 0 ? void 0 : errResponse.data.message}\n(${e.message})`;
                    throw new Error(errorMessage);
                }
            }
            if (data === null || data === void 0 ? void 0 : data.error) {
                if (data.code * 1 === 1 && !this.noRetry) {
                    try {
                        yield this.authorize();
                    }
                    catch (e) {
                        console.error(e);
                        if (e instanceof Error)
                            throw new Error(e.message);
                    }
                    this.noRetry = true;
                    return this.request(method, path, args);
                }
                else {
                    throw new Error(data.message);
                }
            }
            return data;
        });
    }
}
exports.default = LndHub;
