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
const lodash_merge_1 = __importDefault(require("lodash.merge"));
const lodash_pick_1 = __importDefault(require("lodash.pick"));
const webextension_polyfill_1 = __importDefault(require("webextension-polyfill"));
const zustand_1 = require("zustand");
const crypto_1 = require("~/common/lib/crypto");
const settings_1 = require("~/common/settings");
const mv3_1 = require("~/common/utils/mv3");
const bitcoin_1 = __importDefault(require("~/extension/background-script/bitcoin"));
const mnemonic_1 = __importDefault(require("~/extension/background-script/mnemonic"));
const connectors_1 = __importDefault(require("./connectors"));
const liquid_1 = __importDefault(require("./liquid"));
const nostr_1 = __importDefault(require("./nostr"));
// these keys get synced from the state to the browser storage
// the values are the default values
const browserStorageDefaults = {
    settings: Object.assign({}, settings_1.DEFAULT_SETTINGS),
    accounts: {},
    currentAccountId: null,
    migrations: [],
    nostrPrivateKey: null,
};
const browserStorageKeys = Object.keys(browserStorageDefaults);
let storage = "sync";
const getFreshState = () => ({
    connector: null,
    account: null,
    settings: Object.assign({}, settings_1.DEFAULT_SETTINGS),
    migrations: [],
    accounts: {},
    currentAccountId: null,
    liquid: null,
    // TODO: move nostr object to account state and handle encryption/decryption there
    nostr: null,
    // TODO: this should be deleted from storage and then can be removed (requires a migration)
    nostrPrivateKey: null,
    // TODO: move mnemonic object to account state and handle encryption/decryption there
    mnemonic: null,
    // TODO: move bitcoin object to account state and handle encryption/decryption there
    bitcoin: null,
    mv2Password: null,
});
const state = (0, zustand_1.create)((set, get) => (Object.assign(Object.assign({}, getFreshState()), { password: (password) => __awaiter(void 0, void 0, void 0, function* () {
        if (mv3_1.isManifestV3) {
            if (password) {
                // @ts-ignore: https://github.com/mozilla/webextension-polyfill/issues/329
                yield webextension_polyfill_1.default.storage.session.set({ password });
            }
            // @ts-ignore: https://github.com/mozilla/webextension-polyfill/issues/329
            const storageSessionPassword = yield webextension_polyfill_1.default.storage.session.get("password");
            return storageSessionPassword.password;
        }
        else {
            if (password) {
                set({ mv2Password: password });
            }
            return get().mv2Password;
        }
    }), getAccount: () => {
        const currentAccountId = get().currentAccountId;
        let account = null;
        if (currentAccountId) {
            account = get().accounts[currentAccountId];
        }
        return account;
    }, getConnector: () => __awaiter(void 0, void 0, void 0, function* () {
        if (get().connector) {
            const connector = (yield get().connector);
            return connector;
        }
        // use a Promise to initialize the connector
        // this makes sure we can immediatelly set the state and use the same promise for future calls
        // we must make sure not two connections are initialized
        const connectorPromise = (() => __awaiter(void 0, void 0, void 0, function* () {
            const currentAccountId = get().currentAccountId;
            const account = get().accounts[currentAccountId];
            const password = yield get().password();
            if (!password)
                throw new Error("Password is not set");
            const config = (0, crypto_1.decryptData)(account.config, password);
            const connector = new connectors_1.default[account.connector](account, config);
            yield connector.init();
            return connector;
        }))();
        set({ connector: connectorPromise });
        const connector = yield connectorPromise;
        return connector;
    }), getLiquid: () => __awaiter(void 0, void 0, void 0, function* () {
        const currentLiquid = get().liquid;
        if (currentLiquid) {
            return currentLiquid;
        }
        const mnemonic = yield get().getMnemonic();
        const currentAccountId = get().currentAccountId;
        const account = get().accounts[currentAccountId];
        const bitcoinNetwork = account.bitcoinNetwork || "bitcoin";
        const liquid = new liquid_1.default(mnemonic, bitcoinNetwork === "bitcoin" ? "liquid" : bitcoinNetwork);
        set({ liquid });
        return liquid;
    }), getNostr: () => __awaiter(void 0, void 0, void 0, function* () {
        const currentNostr = get().nostr;
        if (currentNostr) {
            return currentNostr;
        }
        const currentAccountId = get().currentAccountId;
        const account = get().accounts[currentAccountId];
        const password = yield get().password();
        if (!password)
            throw new Error("Password is not set");
        const privateKey = (0, crypto_1.decryptData)(account.nostrPrivateKey, password);
        const nostr = new nostr_1.default(privateKey);
        set({ nostr });
        return nostr;
    }), getMnemonic: () => __awaiter(void 0, void 0, void 0, function* () {
        const currentMnemonic = get().mnemonic;
        if (currentMnemonic) {
            return currentMnemonic;
        }
        const currentAccountId = get().currentAccountId;
        const account = get().accounts[currentAccountId];
        const password = yield get().password();
        if (!password)
            throw new Error("Password is not set");
        const mnemonicString = (0, crypto_1.decryptData)(account.mnemonic, password);
        const mnemonic = new mnemonic_1.default(mnemonicString);
        set({ mnemonic });
        return mnemonic;
    }), getBitcoin: () => __awaiter(void 0, void 0, void 0, function* () {
        const currentBitcoin = get().bitcoin;
        if (currentBitcoin) {
            return currentBitcoin;
        }
        const mnemonic = yield get().getMnemonic();
        const currentAccountId = get().currentAccountId;
        const account = get().accounts[currentAccountId];
        const networkType = account.bitcoinNetwork || "bitcoin";
        const bitcoin = new bitcoin_1.default(mnemonic, networkType);
        set({ bitcoin });
        return bitcoin;
    }), lock: () => __awaiter(void 0, void 0, void 0, function* () {
        if (mv3_1.isManifestV3) {
            // @ts-ignore: https://github.com/mozilla/webextension-polyfill/issues/329
            yield webextension_polyfill_1.default.storage.session.set({ password: null });
        }
        else {
            set({ mv2Password: null });
        }
        const allTabs = yield webextension_polyfill_1.default.tabs.query({ title: "Alby" });
        // https://stackoverflow.com/a/54317362/1667461
        const allTabIds = Array.from(allTabs, (tab) => tab.id).filter((id, index) => {
            // Safari: allTabs consist of Start Pages too
            return typeof id === "number" && allTabs[index].title !== "";
        });
        // Safari: extension popup is not a tab
        if (allTabIds.length)
            webextension_polyfill_1.default.tabs.remove(allTabIds);
        if (get().connector) {
            const connector = (yield get().connector);
            yield connector.unload();
        }
        set({
            connector: null,
            account: null,
            liquid: null,
            nostr: null,
            mnemonic: null,
            bitcoin: null,
        });
    }), isUnlocked: () => __awaiter(void 0, void 0, void 0, function* () {
        const password = yield yield get().password();
        return !!password;
    }), init: () => {
        return webextension_polyfill_1.default.storage.sync
            .get(browserStorageKeys)
            .then((result) => {
            // Deep merge to ensure that nested defaults are also merged instead of overwritten.
            const data = (0, lodash_merge_1.default)(browserStorageDefaults, result);
            set(data);
        })
            .catch((e) => {
            console.info("storage.sync is not available. using storage.local");
            storage = "local";
            return webextension_polyfill_1.default.storage.local.get("__sync").then((result) => {
                // Deep merge to ensure that nested defaults are also merged instead of overwritten.
                const data = (0, lodash_merge_1.default)(browserStorageDefaults, result.mockSync);
                set(data);
            });
        });
    }, reset: () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // @ts-ignore: https://github.com/mozilla/webextension-polyfill/issues/329
            yield webextension_polyfill_1.default.storage.session.clear();
        }
        catch (error) {
            console.error("Failed to clear session storage", error);
        }
        if (storage === "sync") {
            yield webextension_polyfill_1.default.storage.sync.clear();
        }
        else {
            yield webextension_polyfill_1.default.storage.local.clear();
        }
        set(Object.assign({}, getFreshState()));
        yield get().saveToStorage();
    }), saveToStorage: () => {
        const current = get();
        const data = Object.assign(Object.assign({}, browserStorageDefaults), (0, lodash_pick_1.default)(current, browserStorageKeys));
        if (storage === "sync") {
            return webextension_polyfill_1.default.storage.sync.set(data);
        }
        else {
            // because there's an overlap with accounts being stored in
            // the local storage, see src/common/lib/cache.ts
            return webextension_polyfill_1.default.storage.local.set({ __sync: data });
        }
    } })));
exports.default = state;
