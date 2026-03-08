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
const lnc_web_1 = __importDefault(require("@lightninglabs/lnc-web"));
const enc_base64_1 = __importDefault(require("crypto-js/enc-base64"));
const enc_hex_1 = __importDefault(require("crypto-js/enc-hex"));
const enc_utf8_1 = __importDefault(require("crypto-js/enc-utf8"));
const lib_typedarrays_1 = __importDefault(require("crypto-js/lib-typedarrays"));
const sha256_1 = __importDefault(require("crypto-js/sha256"));
const lodash_snakecase_1 = __importDefault(require("lodash.snakecase"));
const crypto_1 = require("~/common/lib/crypto");
const utils_1 = __importDefault(require("~/common/lib/utils"));
const helpers_1 = require("~/common/utils/helpers");
const paymentRequest_1 = require("~/common/utils/paymentRequest");
const state_1 = __importDefault(require("../state"));
const connector_interface_1 = require("./connector.interface");
const methods = {
    addinvoice: "lnd.lightning.AddInvoice",
    addholdinvoice: "lnd.invoices.AddHoldInvoice",
    settleinvoice: "lnd.invoices.SettleInvoice",
    channelbalance: "lnd.lightning.ChannelBalance",
    connectpeer: "lnd.lightning.ConnectPeer",
    decodepayreq: "lnd.lightning.DecodePayReq",
    disconnectpeer: "lnd.lightning.DisconnectPeer",
    estimatefee: "lnd.lightning.EstimateFee",
    getchaninfo: "lnd.lightning.GetChanInfo",
    getinfo: "lnd.lightning.GetInfo",
    getnetworkinfo: "lnd.lightning.GetNetworkInfo",
    getnodeinfo: "lnd.lightning.GetNodeInfo",
    gettransactions: "lnd.lightning.GetTransactions",
    listchannels: "lnd.lightning.ListChannels",
    listinvoices: "lnd.lightning.ListInvoices",
    listpayments: "lnd.lightning.ListPayments",
    listpeers: "lnd.lightning.ListPeers",
    lookupinvoice: "lnd.lightning.LookupInvoice",
    openchannel: "lnd.lightning.OpenChannelSync",
    queryroutes: "lnd.lightning.QueryRoutes",
    routermc: "lnd.router.QueryMissionControl",
    sendtoroute: "lnd.lightning.SendToRouteSync",
    verifymessage: "lnd.lightning.VerifyMessage",
    walletbalance: "lnd.lightning.WalletBalance",
    newaddress: "lnd.lightning.NewAddress",
    nextaddr: "lnd.walletKit.nextAddr",
    listaddresses: "lnd.walletKit.ListAddresses",
    listunspent: "lnd.walletKit.ListUnspent",
};
const DEFAULT_SERVER_HOST = "mailbox.terminal.lightning.today:443";
const snakeCaseObjectDeep = (value) => {
    if (Array.isArray(value)) {
        return value.map(snakeCaseObjectDeep);
    }
    if (value && typeof value === "object" && value.constructor === Object) {
        const obj = {};
        const keys = Object.keys(value);
        const len = keys.length;
        for (let i = 0; i < len; i += 1) {
            obj[(0, lodash_snakecase_1.default)(keys[i])] = snakeCaseObjectDeep(value[keys[i]]);
        }
        return obj;
    }
    return value;
};
class LncCredentialStore {
    constructor(account, config) {
        this.account = account;
        this.config = config;
    }
    get password() {
        return "";
    }
    set localKey(value) {
        this.config.localKey = value;
        this._save();
    }
    get localKey() {
        return this.config.localKey || "";
    }
    set remoteKey(value) {
        this.config.remoteKey = value;
        this._save();
    }
    get remoteKey() {
        return this.config.remoteKey || "";
    }
    get pairingPhrase() {
        return this.config.pairingPhrase;
    }
    set serverHost(value) {
        this.config.serverHost = value;
        this._save();
    }
    get serverHost() {
        return this.config.serverHost || DEFAULT_SERVER_HOST;
    }
    get isPaired() {
        return true;
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            this.config.localKey = "";
            this.config.remoteKey = "";
            this._save();
        });
    }
    _save() {
        return __awaiter(this, void 0, void 0, function* () {
            const accounts = state_1.default.getState().accounts;
            const password = yield state_1.default.getState().password();
            accounts[this.account.id].config = (0, crypto_1.encryptData)(this.config, password);
            state_1.default.setState({ accounts });
            yield state_1.default.getState().saveToStorage();
            return true;
        });
    }
}
class Lnc {
    constructor(account, config) {
        this.account = account;
        this.config = config;
        this.lnc = new lnc_web_1.default({
            credentialStore: new LncCredentialStore(account, config),
            namespace: this.account.id,
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            console.info("init LNC");
            try {
                yield this.lnc.connect();
            }
            catch (error) {
                console.error("Init LNC failed", error);
                yield this.unload();
            }
        });
    }
    unload() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.lnc) {
                return;
            }
            try {
                console.info("LNC disconnect");
                yield this.lnc.disconnect();
            }
            catch (error) {
                console.error("Unload LNC failed", error);
            }
        });
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
            ...(0, connector_interface_1.flattenRequestMethods)(Object.keys(methods)),
        ];
    }
    requestMethod(method, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const lncCall = methods[method];
            if (!lncCall) {
                throw new Error(`${method} is not supported`);
            }
            const func = lncCall.split(".").reduce((obj, prop) => {
                return obj[prop];
            }, this.lnc);
            return func(args).then((data) => {
                return { data: snakeCaseObjectDeep(data) };
            });
        });
    }
    getInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkConnection();
            const data = yield this.lnc.lnd.lightning.getInfo();
            return {
                data: {
                    alias: data.alias,
                    pubkey: data.identityPubkey,
                    color: data.color,
                },
            };
        });
    }
    getBalance() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            this.checkConnection();
            const data = yield this.lnc.lnd.lightning.channelBalance();
            return {
                data: {
                    balance: parseInt((_b = (_a = data.localBalance) === null || _a === void 0 ? void 0 : _a.sat) !== null && _b !== void 0 ? _b : ""),
                },
            };
        });
    }
    getInvoices() {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkConnection();
            const data = yield this.lnc.lnd.lightning.listInvoices({ reversed: true });
            const invoices = data.invoices
                .map((invoice, index) => {
                let custom_records;
                // TODO: Fill custom records from HTLC
                return {
                    custom_records,
                    id: `${invoice.paymentRequest}-${index}`,
                    memo: invoice.memo,
                    preimage: invoice.rPreimage.toString(),
                    settled: invoice.state === "SETTLED",
                    settleDate: parseInt(invoice.settleDate) * 1000,
                    creationDate: parseInt(invoice.creationDate) * 1000,
                    totalAmount: parseInt(invoice.value),
                    type: "received",
                };
            })
                .reverse();
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
            const outgoingInvoicesResponse = yield this.lnc.lnd.lightning.listPayments({
                reversed: true,
                maxPayments: "100",
                includeIncomplete: false,
            });
            const outgoingInvoices = outgoingInvoicesResponse.payments.map((payment, index) => {
                let memo = "";
                if (payment.paymentRequest) {
                    memo = (0, paymentRequest_1.getPaymentRequestDescription)(payment.paymentRequest);
                }
                return {
                    id: `${payment.paymentRequest}-${index}`,
                    memo: memo,
                    preimage: payment.paymentPreimage,
                    payment_hash: payment.paymentHash,
                    settled: true,
                    settleDate: parseInt(payment.creationTimeNs) / 1000000,
                    creationDate: parseInt(payment.creationTimeNs) / 1000000,
                    totalAmount: parseInt(payment.valueSat),
                    type: "sent",
                };
            });
            return outgoingInvoices;
        });
    }
    // not yet implemented
    connectPeer() {
        return __awaiter(this, void 0, void 0, function* () {
            console.error(`${this.constructor.name} does not implement the getInvoices call`);
            throw new Error("Not yet supported with the currently used account.");
        });
    }
    checkPayment(args) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkConnection();
            const data = yield this.lnc.lnd.lightning.lookupInvoice({
                rHash: args.paymentHash,
            });
            return {
                data: {
                    paid: data.state === "SETTLED",
                },
            };
        });
    }
    sendPayment(args) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            this.checkConnection();
            const data = yield this.lnc.lnd.lightning.sendPaymentSync({
                paymentRequest: args.paymentRequest,
            });
            if (data.paymentError) {
                throw new Error(data.paymentError);
            }
            return {
                data: {
                    preimage: utils_1.default.base64ToHex(data.paymentPreimage.toString()),
                    paymentHash: utils_1.default.base64ToHex(data.paymentHash.toString()),
                    route: {
                        total_amt: parseInt((_b = (_a = data.paymentRoute) === null || _a === void 0 ? void 0 : _a.totalAmtMsat) !== null && _b !== void 0 ? _b : "0") / 1000,
                        total_fees: parseInt((_d = (_c = data.paymentRoute) === null || _c === void 0 ? void 0 : _c.totalFeesMsat) !== null && _d !== void 0 ? _d : "0") / 1000,
                    },
                },
            };
        });
    }
    keysend(args) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            this.checkConnection();
            //See: https://gist.github.com/dellagustin/c3793308b75b6b0faf134e64db7dc915
            const dest_pubkey_hex = args.pubkey;
            const dest_pubkey_base64 = enc_hex_1.default.parse(dest_pubkey_hex).toString(enc_base64_1.default);
            const preimage = lib_typedarrays_1.default.random(32);
            const preimage_base64 = preimage.toString(enc_base64_1.default);
            const hash = (0, sha256_1.default)(preimage).toString(enc_base64_1.default);
            //base64 encode the record values
            const records_base64 = {};
            for (const key in args.customRecords) {
                records_base64[parseInt(key)] = enc_utf8_1.default.parse(args.customRecords[key]).toString(enc_base64_1.default);
            }
            //mandatory record for keysend
            records_base64[5482373484] = preimage_base64;
            const data = yield this.lnc.lnd.lightning.sendPaymentSync({
                dest: dest_pubkey_base64,
                amt: args.amount.toString(),
                paymentHash: hash,
                destCustomRecords: records_base64,
            });
            if (data.paymentError) {
                throw new Error(data.paymentError);
            }
            return {
                data: {
                    preimage: utils_1.default.base64ToHex(data.paymentPreimage.toString()),
                    paymentHash: utils_1.default.base64ToHex(data.paymentHash.toString()),
                    route: {
                        total_amt: parseInt((_b = (_a = data.paymentRoute) === null || _a === void 0 ? void 0 : _a.totalAmtMsat) !== null && _b !== void 0 ? _b : "0") / 1000,
                        total_fees: parseInt((_d = (_c = data.paymentRoute) === null || _c === void 0 ? void 0 : _c.totalFeesMsat) !== null && _d !== void 0 ? _d : "0") / 1000,
                    },
                },
            };
        });
    }
    signMessage(args) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkConnection();
            const data = yield this.lnc.lnd.lightning.signMessage({
                msg: enc_base64_1.default.stringify(enc_utf8_1.default.parse(args.message)),
            });
            return {
                data: {
                    message: args.message,
                    signature: data.signature,
                },
            };
        });
    }
    makeInvoice(args) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkConnection();
            const data = yield this.lnc.lnd.lightning.addInvoice({
                memo: args.memo,
                value: args.amount.toString(),
            });
            return {
                data: {
                    paymentRequest: data.paymentRequest,
                    rHash: utils_1.default.base64ToHex(data.rHash.toString()),
                },
            };
        });
    }
    checkConnection() {
        if (!this.lnc) {
            throw new Error("Account failed to load");
        }
        if (!this.lnc.isConnected) {
            throw new Error("Account is still loading");
        }
    }
}
exports.default = Lnc;
