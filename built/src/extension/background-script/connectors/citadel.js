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
Object.defineProperty(exports, "__esModule", { value: true });
class CitadelConnector {
    constructor(account, config) {
        this.account = account;
        this.config = config;
        this.jwt = "";
    }
    set requestFunc(requestFunc) {
        this._requestFunc = requestFunc;
    }
    init() {
        return Promise.resolve();
    }
    unload() {
        return Promise.resolve();
    }
    get supportedMethods() {
        return [
            "makeInvoice",
            "sendPayment",
            "sendPaymentAsync",
            "signMessage",
            "getInfo",
            "getBalance",
        ];
    }
    getInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureLogin();
            return this.request("GET", "api/v1/lnd/info").then((data) => {
                return {
                    data: {
                        alias: data.alias,
                        pubkey: data.identityPubkey,
                        color: data.color,
                    },
                };
            });
        });
    }
    getTransactions() {
        return __awaiter(this, void 0, void 0, function* () {
            console.error(`getTransactions() is not yet supported with the currently used account: ${this.constructor.name}`);
            return { data: { transactions: [] } };
        });
    }
    // not yet implemented
    connectPeer() {
        return __awaiter(this, void 0, void 0, function* () {
            console.error(`${this.constructor.name} does not implement the getInvoices call`);
            throw new Error("Not yet supported with the currently used account.");
        });
    }
    getBalance() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureLogin();
            return this.request("GET", "api/v1/lnd/wallet/lightning").then((data) => {
                var _a;
                const balance = parseInt((_a = data.localBalance) === null || _a === void 0 ? void 0 : _a.sat);
                return {
                    data: {
                        balance,
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
    sendPayment(args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureLogin();
            return this.request("POST", "api/v1/lnd/lightning/payInvoice", {
                paymentRequest: args.paymentRequest,
            }).then((data) => {
                var _a, _b;
                return {
                    data: {
                        preimage: data.paymentPreimage,
                        paymentHash: data.paymentHash,
                        route: {
                            total_amt: Math.floor(parseInt((_a = data.paymentRoute) === null || _a === void 0 ? void 0 : _a.totalAmtMsat) / 1000),
                            total_fees: parseInt((_b = data.paymentRoute) === null || _b === void 0 ? void 0 : _b.totalFeesMsat),
                        },
                    },
                };
            });
        });
    }
    signMessage(args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureLogin();
            return this.request("POST", "api/v1/lnd/util/sign-message", {
                message: args.message,
            }).then((data) => {
                return {
                    data: {
                        message: args.message,
                        signature: data.signature,
                    },
                };
            });
        });
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.request("POST", "manager-api/v1/account/refresh");
            if (typeof data !== "object" || data === null || !data.jwt) {
                throw new Error("Failed to login.");
            }
            return data.jwt;
        });
    }
    login(password, totpToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.request("POST", "manager-api/v1/account/login", {
                password,
                totpToken,
            });
            if (typeof data !== "object" || data === null || !data.jwt) {
                throw new Error("Failed to login.");
            }
            return data.jwt;
        });
    }
    ensureLogin() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.jwt = yield this.refresh();
            }
            catch (_a) {
                this.jwt = yield this.login(this.config.password, "");
            }
        });
    }
    makeInvoice(args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureLogin();
            return this.request("POST", "api/v1/lnd/util/lightning/addInvoice", {
                memo: args.memo,
                amt: args.amount.toString(),
            }).then((data) => {
                return {
                    data: {
                        paymentRequest: data.paymentRequest,
                        rHash: data.rHashStr,
                    },
                };
            });
        });
    }
    checkPayment(args) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureLogin();
            return this.request("GET", `invoice-info?paymentHash=${args.paymentHash}`).then((data) => {
                return {
                    data: {
                        paid: data.isPaid || data.state === 1,
                    },
                };
            });
        });
    }
    request(method, path, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = this.config.url + (this.config.url.endsWith("/") ? "" : "/") + path;
            const headers = new Headers();
            headers.append("Accept", "application/json");
            headers.append("Content-Type", "application/json");
            if (this.jwt)
                headers.append("Authorization", `JWT ${this.jwt}`);
            const res = yield fetch(url, Object.assign({ headers,
                method }, (method !== "GET" ? { body: JSON.stringify(args) } : {})));
            if (!res.ok) {
                const errBody = yield res.json();
                console.error("errBody", errBody);
                throw new Error(errBody.detail);
            }
            return yield res.json();
        });
    }
}
exports.default = CitadelConnector;
