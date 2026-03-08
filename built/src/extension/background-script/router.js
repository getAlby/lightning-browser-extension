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
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = exports.router = void 0;
const accounts = __importStar(require("./actions/accounts"));
const alby = __importStar(require("./actions/alby"));
const allowances = __importStar(require("./actions/allowances"));
const blocklist = __importStar(require("./actions/blocklist"));
const cache = __importStar(require("./actions/cache"));
const liquid = __importStar(require("./actions/liquid"));
const ln = __importStar(require("./actions/ln"));
const lnurl_1 = __importStar(require("./actions/lnurl"));
const mnemonic = __importStar(require("./actions/mnemonic"));
const nostr = __importStar(require("./actions/nostr"));
const payments = __importStar(require("./actions/payments"));
const permissions = __importStar(require("./actions/permissions"));
const settings = __importStar(require("./actions/settings"));
const setup = __importStar(require("./actions/setup"));
const swaps = __importStar(require("./actions/swaps"));
const webbtc = __importStar(require("./actions/webbtc"));
const webln = __importStar(require("./actions/webln"));
const routes = {
    addAllowance: allowances.add,
    getAllowance: allowances.get,
    getAllowanceById: allowances.getById,
    listAllowances: allowances.list,
    deleteAllowance: allowances.deleteAllowance,
    updateAllowance: allowances.updateAllowance,
    addPermission: permissions.add,
    deletePermission: permissions.deletePermission,
    deletePermissionsById: permissions.deleteByIds,
    listPermissions: permissions.listByAllowance,
    lock: accounts.lock,
    unlock: accounts.unlock,
    getInfo: ln.getInfo,
    getTransactions: ln.getTransactions,
    sendPayment: ln.sendPayment,
    sendPaymentAsync: ln.sendPaymentAsync,
    keysend: ln.keysend,
    checkPayment: ln.checkPayment,
    signMessage: ln.signMessage,
    makeInvoice: ln.makeInvoice,
    connectPeer: ln.connectPeer,
    getPayments: payments.all,
    getPaymentsByAccount: payments.listByAccount,
    accountInfo: accounts.info,
    accountDecryptedDetails: accounts.decryptedDetails,
    addAccount: accounts.add,
    editAccount: accounts.edit,
    getAccounts: accounts.all,
    getAccount: accounts.get,
    removeAccount: accounts.remove,
    selectAccount: accounts.select,
    setPassword: setup.setPassword,
    reset: setup.reset,
    status: setup.status,
    validateAccount: setup.validateAccount,
    setIcon: setup.setIconMessageHandler,
    changePassword: settings.changePassword,
    setSetting: settings.set,
    getSettings: settings.get,
    addBlocklist: blocklist.add,
    deleteBlocklist: blocklist.deleteBlocklist,
    getBlocklist: blocklist.get,
    listBlocklist: blocklist.list,
    lnurl: lnurl_1.default,
    lnurlAuth: lnurl_1.auth,
    getCurrencyRate: cache.getCurrencyRate,
    setMnemonic: mnemonic.setMnemonic,
    getMnemonic: mnemonic.getMnemonic,
    generateMnemonic: mnemonic.generateMnemonic,
    getSwapInfo: swaps.info,
    createSwap: swaps.createSwap,
    liquid: {
        signPset: liquid.signPset,
        getPsetPreview: liquid.getPsetPreview,
        fetchAssetRegistry: liquid.fetchAssetRegistry,
    },
    nostr: {
        generatePrivateKey: nostr.generatePrivateKey,
        getPrivateKey: nostr.getPrivateKey,
        getPublicKey: nostr.getPublicKey,
        removePrivateKey: nostr.removePrivateKey,
        setPrivateKey: nostr.setPrivateKey,
    },
    webbtc: {
        getPsbtPreview: webbtc.getPsbtPreview,
        signPsbt: webbtc.signPsbt,
        getAddress: webbtc.getAddress,
    },
    // Public calls that are accessible from the inpage script (through the content script)
    public: {
        webbtc: {
            isEnabled: webbtc.isEnabled,
            enable: webbtc.enable,
            getInfo: webbtc.getInfo,
            signPsbtWithPrompt: webbtc.signPsbtWithPrompt,
            getAddressOrPrompt: webbtc.getAddressOrPrompt,
        },
        alby: {
            isEnabled: alby.isEnabled,
            enable: alby.enable,
            addAccount: accounts.promptAdd,
        },
        webln: {
            enable: webln.enable,
            isEnabled: webln.isEnabled,
            getInfo: ln.getInfo,
            sendPaymentOrPrompt: webln.sendPaymentOrPrompt,
            sendPaymentAsyncWithPrompt: webln.sendPaymentAsyncWithPrompt,
            keysendOrPrompt: webln.keysendOrPrompt,
            signMessageOrPrompt: webln.signMessageOrPrompt,
            lnurl: webln.lnurl,
            makeInvoice: webln.makeInvoiceOrPrompt,
            getBalanceOrPrompt: webln.getBalanceOrPrompt,
            request: ln.request,
        },
        liquid: {
            isEnabled: liquid.isEnabled,
            enable: liquid.enable,
            getAddressOrPrompt: liquid.getAddressOrPrompt,
            signPsetWithPrompt: liquid.signPsetWithPrompt,
        },
        nostr: {
            isEnabled: nostr.isEnabled,
            enable: nostr.enable,
            getPublicKeyOrPrompt: nostr.getPublicKeyOrPrompt,
            signEventOrPrompt: nostr.signEventOrPrompt,
            signSchnorrOrPrompt: nostr.signSchnorrOrPrompt,
            encryptOrPrompt: nostr.encryptOrPrompt,
            decryptOrPrompt: nostr.decryptOrPrompt,
            nip44EncryptOrPrompt: nostr.nip44EncryptOrPrompt,
            nip44DecryptOrPrompt: nostr.nip44DecryptOrPrompt,
        },
    },
};
exports.routes = routes;
const router = (path) => {
    if (!path) {
        throw new Error("No action path provided to router");
    }
    const routeParts = path.split("/");
    const route = routeParts.reduce((route, path) => {
        return route[path];
    }, routes);
    if (!route) {
        console.warn(`Route not found: ${path}`);
        // return a function to keep the expected method signature
        return () => {
            return Promise.reject({ error: `${path} not found` });
        };
    }
    return route;
};
exports.router = router;
