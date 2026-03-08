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
exports.getCurrencyRate = exports.sendPaymentAsync = exports.sendPayment = exports.lnurlAuth = exports.getTransactions = exports.getBlocklist = exports.unlock = exports.removeAccount = exports.setSetting = exports.connectPeer = exports.makeInvoice = exports.getInfo = exports.getStatus = exports.getSettings = exports.getPaymentsByAccount = exports.getPayments = exports.getAllowance = exports.editAccount = exports.selectAccount = exports.updateAllowance = exports.getAccount = exports.getAccounts = exports.swrGetAccountInfo = exports.getAccountInfo = void 0;
const cache_1 = require("./cache");
const msg_1 = __importDefault(require("./msg"));
const getAccountInfo = () => msg_1.default.request("accountInfo");
exports.getAccountInfo = getAccountInfo;
/**
 * stale-while-revalidate get account info
 * @param id - account id
 * @param callback - will be called first with cached (stale) data first, then with fresh data.
 */
const swrGetAccountInfo = (id, callback) => __awaiter(void 0, void 0, void 0, function* () {
    const accountsCache = yield (0, cache_1.getAccountsCache)();
    return new Promise((resolve, reject) => {
        if (accountsCache[id]) {
            if (callback)
                callback(accountsCache[id]);
            resolve(accountsCache[id]);
        }
        // Update account info with most recent data, save to cache.
        (0, exports.getAccountInfo)()
            .then((response) => {
            const { alias } = response.info;
            const { balance: resBalance, currency } = response.balance;
            const name = response.name;
            const connectorType = response.connectorType;
            const balance = typeof resBalance === "number" ? resBalance : parseInt(resBalance); // TODO: handle amounts
            const avatarUrl = response.avatarUrl;
            const account = {
                id,
                name,
                alias,
                balance,
                connectorType,
                currency: currency || "BTC",
                avatarUrl,
                lightningAddress: response.info.lightning_address,
                nodeRequired: response.info.node_required,
            };
            (0, cache_1.storeAccounts)(Object.assign(Object.assign({}, accountsCache), { [id]: account }));
            if (callback)
                callback(account);
            return resolve(account);
        })
            .catch(reject);
    });
});
exports.swrGetAccountInfo = swrGetAccountInfo;
const getAccounts = () => msg_1.default.request("getAccounts");
exports.getAccounts = getAccounts;
const getAccount = (id) => msg_1.default.request("getAccount", {
    id,
});
exports.getAccount = getAccount;
const validateAccount = (account) => msg_1.default.request("validateAccount", account);
const updateAllowance = () => msg_1.default.request("updateAllowance");
exports.updateAllowance = updateAllowance;
const selectAccount = (id) => msg_1.default.request("selectAccount", { id });
exports.selectAccount = selectAccount;
const editAccount = (id, args) => msg_1.default.request("editAccount", Object.assign({ id }, args));
exports.editAccount = editAccount;
const getAllowance = (host) => msg_1.default.request("getAllowance", { host });
exports.getAllowance = getAllowance;
const getPayments = (options) => msg_1.default.request("getPayments", options);
exports.getPayments = getPayments;
const getPaymentsByAccount = (options) => msg_1.default.request("getPaymentsByAccount", options);
exports.getPaymentsByAccount = getPaymentsByAccount;
const getSettings = () => msg_1.default.request("getSettings");
exports.getSettings = getSettings;
const getStatus = () => msg_1.default.request("status");
exports.getStatus = getStatus;
const getInfo = () => msg_1.default.request("getInfo");
exports.getInfo = getInfo;
const makeInvoice = ({ amount, memo }) => msg_1.default.request("makeInvoice", { amount, memo });
exports.makeInvoice = makeInvoice;
const connectPeer = ({ host, pubkey }) => msg_1.default.request("connectPeer", { host, pubkey });
exports.connectPeer = connectPeer;
const setSetting = (setting) => msg_1.default.request("setSetting", {
    setting,
});
exports.setSetting = setSetting;
const removeAccount = (id) => Promise.all([
    msg_1.default.request("removeAccount", { id }),
    (0, cache_1.removeAccountFromCache)(id),
]);
exports.removeAccount = removeAccount;
const unlock = (password) => msg_1.default.request("unlock", { password });
exports.unlock = unlock;
const getBlocklist = (host) => msg_1.default.request("getBlocklist", { host });
exports.getBlocklist = getBlocklist;
const getTransactions = (options) => msg_1.default.request("getTransactions", options);
exports.getTransactions = getTransactions;
const lnurlAuth = (options) => msg_1.default.request("lnurlAuth", options);
exports.lnurlAuth = lnurlAuth;
const sendPayment = (paymentRequest, origin) => msg_1.default.request("sendPayment", { paymentRequest }, {
    origin,
});
exports.sendPayment = sendPayment;
const sendPaymentAsync = (paymentRequest, origin) => msg_1.default.request("sendPaymentAsync", { paymentRequest }, {
    origin,
});
exports.sendPaymentAsync = sendPaymentAsync;
const getCurrencyRate = () => __awaiter(void 0, void 0, void 0, function* () { return msg_1.default.request("getCurrencyRate"); });
exports.getCurrencyRate = getCurrencyRate;
const getNostrPrivateKey = (id) => msg_1.default.request("nostr/getPrivateKey", {
    id,
});
const getNostrPublicKey = (id) => msg_1.default.request("nostr/getPublicKey", {
    id,
});
const generateNostrPrivateKey = (id) => msg_1.default.request("nostr/generatePrivateKey", {
    id,
});
const removeNostrPrivateKey = (id) => msg_1.default.request("nostr/removePrivateKey", {
    id,
});
const setNostrPrivateKey = (id, privateKey) => msg_1.default.request("nostr/setPrivateKey", {
    id,
    privateKey,
});
const getMnemonic = (id) => msg_1.default.request("getMnemonic", {
    id,
});
const generateMnemonic = () => msg_1.default.request("generateMnemonic");
// TODO: consider adding removeMnemonic function, make mnemonic a string here rather than optional (null = delete current mnemonic)
const setMnemonic = (id, mnemonic) => msg_1.default.request("setMnemonic", {
    id,
    mnemonic,
});
const getSwapInfo = () => msg_1.default.request("getSwapInfo");
const createSwap = (params) => msg_1.default.request("createSwap", params);
const getLiquidPsetPreview = (pset) => msg_1.default.request("liquid/getPsetPreview", {
    pset,
});
const fetchLiquidAssetRegistry = (psetPreview) => msg_1.default.request("liquid/fetchAssetRegistry", {
    psetPreview,
});
const signPset = (pset) => msg_1.default.request("liquid/signPset", {
    pset,
});
const getPsbtPreview = (psbt) => msg_1.default.request("webbtc/getPsbtPreview", {
    psbt,
});
const signPsbt = (psbt) => msg_1.default.request("webbtc/signPsbt", {
    psbt,
});
exports.default = {
    getAccount: exports.getAccount,
    getAccountInfo: exports.getAccountInfo,
    getAccounts: exports.getAccounts,
    editAccount: exports.editAccount,
    getInfo: exports.getInfo,
    selectAccount: exports.selectAccount,
    validateAccount,
    getAllowance: exports.getAllowance,
    updateAllowance: exports.updateAllowance,
    getPayments: exports.getPayments,
    getPaymentsByAccount: exports.getPaymentsByAccount,
    getSettings: exports.getSettings,
    getStatus: exports.getStatus,
    makeInvoice: exports.makeInvoice,
    connectPeer: exports.connectPeer,
    setSetting: exports.setSetting,
    swr: {
        getAccountInfo: exports.swrGetAccountInfo,
    },
    removeAccount: exports.removeAccount,
    unlock: exports.unlock,
    getBlocklist: exports.getBlocklist,
    getTransactions: exports.getTransactions,
    lnurlAuth: exports.lnurlAuth,
    getCurrencyRate: exports.getCurrencyRate,
    sendPayment: exports.sendPayment,
    sendPaymentAsync: exports.sendPaymentAsync,
    nostr: {
        getPrivateKey: getNostrPrivateKey,
        getPublicKey: getNostrPublicKey,
        generatePrivateKey: generateNostrPrivateKey,
        setPrivateKey: setNostrPrivateKey,
        removePrivateKey: removeNostrPrivateKey,
    },
    getMnemonic,
    setMnemonic,
    generateMnemonic,
    getSwapInfo,
    createSwap,
    liquid: {
        getPsetPreview: getLiquidPsetPreview,
        fetchAssetRegistry: fetchLiquidAssetRegistry,
        signPset: signPset,
    },
    bitcoin: {
        getPsbtPreview,
        signPsbt,
    },
};
