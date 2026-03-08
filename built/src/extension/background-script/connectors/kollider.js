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
const enc_hex_1 = __importDefault(require("crypto-js/enc-hex"));
const sha256_1 = __importDefault(require("crypto-js/sha256"));
const currencyConvert_1 = require("~/common/utils/currencyConvert");
const signer_1 = __importDefault(require("~/common/utils/signer"));
const API_URL = "https://kollider.me/api";
const defaultHeaders = {
    Accept: "application/json",
    "Content-Type": "application/json",
};
class Kollider {
    constructor(account, config) {
        this.account = account;
        this.config = config;
        this.currency = config.currency;
        this.currentAccountId = null;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.authorize();
            yield this.loadAccounts();
            this.currentAccountId = yield this.findAccountId(this.config.currency);
        });
    }
    unload() {
        return Promise.resolve();
    }
    // not yet implemented
    connectPeer() {
        return __awaiter(this, void 0, void 0, function* () {
            console.error(`${this.constructor.name} does not implement the connectPeer call`);
            throw new Error("Not yet supported with the currently used account.");
        });
    }
    getTransactions() {
        return __awaiter(this, void 0, void 0, function* () {
            console.error(`getTransactions() is not yet supported with the currently used account: ${this.constructor.name}`);
            return { data: { transactions: [] } };
        });
    }
    getInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            return { data: { alias: `Kollider (${this.currency})` } };
        });
    }
    getBalance() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadAccounts();
            const account = yield this.findAccount(this.currency);
            if (!account) {
                throw new Error("Account not found");
            }
            let balance = account.balance;
            if (account.currency === "BTC") {
                balance = Math.round((0, currencyConvert_1.getBTCToSats)(account.balance)).toString();
            }
            return {
                data: {
                    balance: parseFloat(balance),
                    currency: account.currency,
                },
            };
        });
    }
    sendPayment(args) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.request("POST", "/payinvoice", {
                payment_request: args.paymentRequest,
                currency: this.config.currency,
            });
            if (data.error) {
                throw new Error(data.error);
            }
            const amountInSats = (0, currencyConvert_1.getBTCToSats)(((_a = data.amount) === null || _a === void 0 ? void 0 : _a.value) || 0).toString();
            const feesInSats = (0, currencyConvert_1.getBTCToSats)(((_b = data.fees) === null || _b === void 0 ? void 0 : _b.value) || 0).toString();
            const payment_route = {
                total_amt: parseFloat(amountInSats),
                total_fees: parseFloat(feesInSats),
            };
            return {
                data: {
                    preimage: data.payment_preimage || "",
                    paymentHash: data.payment_hash,
                    route: payment_route,
                },
            };
        });
    }
    keysend(args) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Keysend is not supported with the currently used account.");
        });
    }
    checkPayment(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.request("GET", `/checkpayment`, {
                payment_hash: args.paymentHash,
            });
            return {
                data: {
                    paid: !!(data === null || data === void 0 ? void 0 : data.paid),
                },
            };
        });
    }
    signMessage(args) {
        // make sure we got the config to create a new key
        if (!this.config.username || !this.config.password) {
            return Promise.reject(new Error("Missing config"));
        }
        if (!args.message) {
            return Promise.reject(new Error("Invalid message"));
        }
        const message = (0, sha256_1.default)(args.message).toString(enc_hex_1.default);
        const keyHex = (0, sha256_1.default)(`kollider://${this.config.username}:${this.config.password}`).toString(enc_hex_1.default);
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
            const amountInBTC = (0, currencyConvert_1.getSatsToBTC)(args.amount);
            const data = yield this.request("GET", "/addinvoice", {
                amount: amountInBTC,
                currency: "BTC",
                target_account_currency: this.currency,
                account_id: this.currentAccountId,
                meta: args.memo,
            });
            if (data.error) {
                throw new Error(data.error);
            }
            return {
                data: {
                    paymentRequest: data.payment_request,
                    rHash: data.payment_hash,
                },
            };
        });
    }
    authorize() {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const { data: authData } = yield axios_1.default.post(`${API_URL}/auth`, {
                username: this.config.username,
                password: this.config.password,
            }, {
                headers: defaultHeaders,
                adapter: "fetch",
            });
            if (authData.error || authData.errors) {
                const error = authData.error || authData.errors;
                const errMessage = ((_b = (_a = error === null || error === void 0 ? void 0 : error.errors) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || ((_c = error === null || error === void 0 ? void 0 : error[0]) === null || _c === void 0 ? void 0 : _c.message);
                console.error(errMessage);
                throw new Error("Kollider API error: " + errMessage);
            }
            else {
                this.refresh_token = authData.refresh;
                this.access_token = authData.token;
                this.refresh_token_created = +new Date();
                this.access_token_created = +new Date();
                return authData;
            }
        });
    }
    loadAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.request("GET", "/balance", undefined);
            this.accounts = response.accounts;
        });
    }
    findAccount(currency) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountId = yield this.findAccountId(currency);
            if (accountId && this.accounts) {
                return this.accounts[accountId];
            }
            else {
                return null;
            }
        });
    }
    findAccountId(currency) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.accounts) {
                yield this.loadAccounts();
            }
            // guess only for typescript. loadAccounts loads the accounts :)
            if (!this.accounts) {
                return null;
            }
            const accounts = this.accounts; // just to use in the find()
            const accountIds = Object.keys(this.accounts);
            const currentAccountId = accountIds.find((id) => {
                return accounts[id].currency === currency;
            });
            return currentAccountId || null;
        });
    }
    request(method, path, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.access_token) {
                yield this.authorize();
            }
            const reqConfig = {
                method,
                url: `${API_URL}${path}`,
                responseType: "json",
                adapter: "fetch",
                headers: Object.assign(Object.assign({}, defaultHeaders), { Authorization: `${this.access_token}` }),
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
                    const errorMessage = `${errResponse === null || errResponse === void 0 ? void 0 : errResponse.data.error}\n(${e.message})`;
                    throw new Error(errorMessage);
                }
            }
            return data;
        });
    }
}
exports.default = Kollider;
