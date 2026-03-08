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
const webextension_polyfill_1 = __importDefault(require("webextension-polyfill"));
const crypto_1 = require("~/common/lib/crypto");
const state_1 = __importDefault(require("../state"));
class Alby {
    constructor(account, config) {
        this._cache = new Map();
        this.account = account;
        this.config = config;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this._authUser = yield this.authorize();
                this._client = new sdk_1.Client(this._authUser, this._getRequestOptions());
            }
            catch (error) {
                console.error("Failed to initialize alby connector", error);
                this._authUser = undefined;
                this._client = undefined;
                yield this.unload();
            }
        });
    }
    getOAuthToken() {
        return this.config.oAuthToken;
    }
    persistUserIdentifier(userIdentifier) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.config.userIdentifer) {
                if (this.account.id) {
                    const accounts = state_1.default.getState().accounts;
                    const password = (yield state_1.default.getState().password());
                    const configData = (0, crypto_1.decryptData)(accounts[this.account.id].config, password);
                    configData.userIdentifer = userIdentifier;
                    accounts[this.account.id].config = (0, crypto_1.encryptData)(configData, password);
                    state_1.default.setState({ accounts });
                    // make sure we immediately persist the updated accounts
                    yield state_1.default.getState().saveToStorage();
                }
            }
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
            "getBalance",
            "getTransactions",
        ];
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
            const invoicesResponse = (yield this._request((client) => client.invoices({})));
            const transactions = invoicesResponse
                .map((invoice, index) => {
                var _a;
                return ({
                    custom_records: invoice.custom_records,
                    id: `${invoice.payment_request}-${index}`,
                    memo: invoice.comment || invoice.memo,
                    preimage: (_a = invoice.preimage) !== null && _a !== void 0 ? _a : "",
                    payment_hash: invoice.payment_hash,
                    settled: invoice.settled,
                    settleDate: new Date(invoice.settled_at).getTime(),
                    creationDate: new Date(invoice.created_at).getTime(),
                    totalAmount: invoice.amount,
                    type: invoice.type == "incoming" ? "received" : "sent",
                });
            })
                .filter((transaction) => transaction.settled);
            return {
                data: {
                    transactions,
                },
            };
        });
    }
    getInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = "getInfo";
            const cacheValue = this._cache.get(cacheKey);
            if (cacheValue) {
                if (!this.config.userIdentifer) {
                    this.persistUserIdentifier(cacheValue.data.identifier);
                }
                return cacheValue;
            }
            try {
                const info = yield this._getUserDetails();
                const returnValue = {
                    data: Object.assign(Object.assign({}, info), { alias: "🐝 getalby.com" }),
                };
                this._cache.set(cacheKey, returnValue);
                if (!this.config.userIdentifer) {
                    this.persistUserIdentifier(info.identifier);
                }
                return returnValue;
            }
            catch (error) {
                console.error(error);
                throw error;
            }
        });
    }
    getBalance() {
        return __awaiter(this, void 0, void 0, function* () {
            const { balance } = yield this._request((client) => client.accountBalance({}));
            return {
                data: {
                    balance,
                },
            };
        });
    }
    sendPayment(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this._request((client) => client.sendPayment({
                invoice: args.paymentRequest,
            }));
            return {
                data: {
                    preimage: data.payment_preimage,
                    paymentHash: data.payment_hash,
                    route: { total_amt: data.amount, total_fees: data.fee },
                },
            };
        });
    }
    keysend(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this._request((client) => client.keysend({
                destination: args.pubkey,
                amount: args.amount,
                customRecords: args.customRecords,
            }));
            return {
                data: {
                    preimage: data.payment_preimage,
                    paymentHash: data.payment_hash,
                    route: { total_amt: data.amount, total_fees: data.fee },
                },
            };
        });
    }
    checkPayment(args) {
        return __awaiter(this, void 0, void 0, function* () {
            let paid = false;
            try {
                const invoice = yield this._request((client) => client.getInvoice(args.paymentHash));
                paid = !!(invoice === null || invoice === void 0 ? void 0 : invoice.settled);
            }
            catch (error) {
                console.error(error);
            }
            return {
                data: {
                    paid,
                },
            };
        });
    }
    signMessage(args) {
        // signMessage requires proof of ownership of a non-custodial node
        // this is not the case in the Alby connector which connects to Lndhub
        throw new Error("SignMessage is not supported by Alby accounts. Generate a Master Key to use LNURL auth.");
    }
    makeInvoice(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this._request((client) => client.createInvoice({
                amount: parseInt(args.amount.toString()),
                description: args.memo,
            }));
            return {
                data: {
                    paymentRequest: data.payment_request,
                    rHash: data.payment_hash,
                },
            };
        });
    }
    getSwapInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._request((client) => client.getSwapInfo());
            return result;
        });
    }
    createSwap(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this._request((client) => client.createSwap(params));
            return result;
        });
    }
    authorize() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const clientId = process.env.ALBY_OAUTH_CLIENT_ID;
                const clientSecret = process.env.ALBY_OAUTH_CLIENT_SECRET;
                if (!clientId || !clientSecret) {
                    throw new Error("OAuth client credentials missing");
                }
                const redirectURL = "https://getalby.com/extension/connect";
                const authClient = new sdk_1.OAuth2User({
                    request_options: this._getRequestOptions(),
                    client_id: clientId,
                    client_secret: clientSecret,
                    callback: redirectURL,
                    user_agent: `lightning-browser-extension:${process.env.VERSION}`,
                    scopes: [
                        "account:read",
                        "balance:read",
                        "invoices:create",
                        "invoices:read",
                        "payments:send",
                        "transactions:read", // for outgoing invoice
                    ],
                    token: this.config.oAuthToken, // initialize with existing token
                });
                authClient.on("tokenRefreshed", (token) => {
                    this._updateOAuthToken(token);
                });
                // Currently the JS SDK guarantees request of a new refresh token is done synchronously.
                // The only way a refresh should fail is if the refresh token has expired, which is handled when the connector is initialized.
                // If a token refresh fails after init then the connector will be unusable, but we will still log errors here so that this can be debugged if it does ever happen.
                authClient.on("tokenRefreshFailed", (error) => {
                    console.error("Failed to Refresh token", error);
                });
                if (this.config.oAuthToken) {
                    try {
                        if (authClient.isAccessTokenExpired()) {
                            yield authClient.refreshAccessToken();
                        }
                        return authClient;
                    }
                    catch (error) {
                        console.error("Failed to request new auth token", error);
                    }
                }
                let authUrl = yield authClient.generateAuthURL({
                    code_challenge_method: "S256",
                    authorizeUrl: process.env.ALBY_OAUTH_AUTHORIZE_URL,
                });
                authUrl += "&webln=false"; // stop getalby.com login modal launching lnurl auth
                if (this.config.userIdentifer) {
                    authUrl += `&identifier=${this.config.userIdentifer}`;
                }
                const oAuthTab = yield webextension_polyfill_1.default.tabs.create({ url: authUrl });
                return new Promise((resolve, reject) => {
                    const handleTabUpdated = (tabId, changeInfo, tab) => {
                        if (changeInfo.status === "complete" && tabId === oAuthTab.id) {
                            const authorizationCode = this.extractCodeFromTabUrl(tab.url);
                            if (!authorizationCode) {
                                throw new Error("no authorization code");
                            }
                            authClient
                                .requestAccessToken(authorizationCode)
                                .then((token) => {
                                this._updateOAuthToken(token.token);
                                resolve(authClient);
                            })
                                .catch((error) => {
                                console.error("Failed to request new auth token", error);
                                reject(error);
                            })
                                .finally(() => {
                                webextension_polyfill_1.default.tabs.remove(tabId);
                                webextension_polyfill_1.default.tabs.onUpdated.removeListener(handleTabUpdated);
                            });
                        }
                    };
                    const handleTabRemoved = (tabId) => {
                        if (tabId === oAuthTab.id) {
                            // The user closed the authentication tab without completing the flow
                            const error = new Error("OAuth authentication canceled by user");
                            reject(error);
                            webextension_polyfill_1.default.tabs.onRemoved.removeListener(handleTabRemoved);
                        }
                    };
                    webextension_polyfill_1.default.tabs.onUpdated.addListener(handleTabUpdated);
                    webextension_polyfill_1.default.tabs.onRemoved.addListener(handleTabRemoved);
                });
            }
            catch (error) {
                console.error(error);
                throw error;
            }
        });
    }
    extractCodeFromTabUrl(url) {
        if (!url) {
            return null;
        }
        const urlSearchParams = new URLSearchParams(url.split("?")[1]);
        return urlSearchParams.get("code");
    }
    _request(func) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._authUser || !this._client) {
                throw new Error("Alby client was not initialized");
            }
            let result;
            try {
                result = yield func(this._client);
            }
            catch (error) {
                console.error(error);
                throw error;
            }
            return result;
        });
    }
    _getRequestOptions() {
        return Object.assign({ user_agent: `lightning-browser-extension:${process.env.VERSION}` }, (process.env.ALBY_API_URL
            ? {
                base_url: process.env.ALBY_API_URL,
            }
            : {}));
    }
    _updateOAuthToken(newToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const access_token = newToken.access_token;
            const refresh_token = newToken.refresh_token;
            const expires_at = newToken.expires_at;
            if (access_token && refresh_token && expires_at) {
                this.config.oAuthToken = { access_token, refresh_token, expires_at };
                if (this.account.id) {
                    const accounts = state_1.default.getState().accounts;
                    const password = (yield state_1.default.getState().password());
                    const configData = (0, crypto_1.decryptData)(accounts[this.account.id].config, password);
                    configData.oAuthToken = this.config.oAuthToken;
                    accounts[this.account.id].config = (0, crypto_1.encryptData)(configData, password);
                    state_1.default.setState({ accounts });
                    // make sure we immediately persist the updated accounts
                    yield state_1.default.getState().saveToStorage();
                }
            }
            else {
                console.error("Invalid token");
                throw new Error("Invalid token");
            }
        });
    }
    _getUserDetails() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${process.env.ALBY_API_URL}/internal/users`;
            const requestOptions = {
                method: "GET",
                headers: Object.assign(Object.assign({ "Content-Type": "application/json" }, (yield ((_a = this._authUser) === null || _a === void 0 ? void 0 : _a.getAuthHeader()))), { "User-Agent": `lightning-browser-extension:${process.env.VERSION}`, "X-User-Agent": `lightning-browser-extension:${process.env.VERSION}` }),
            };
            try {
                const details = yield this._genericRequest(url, requestOptions);
                return details;
            }
            catch (error) {
                console.error("Error fetching user details:", error);
                throw error;
            }
        });
    }
    _genericRequest(url, init) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield fetch(url, init);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = yield res.json();
            return data;
        });
    }
}
exports.default = Alby;
