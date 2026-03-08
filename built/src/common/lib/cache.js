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
exports.removeAccountFromCache = exports.storeAccounts = exports.getAccountsCache = void 0;
const webextension_polyfill_1 = __importDefault(require("webextension-polyfill"));
const getAccountsCache = () => __awaiter(void 0, void 0, void 0, function* () {
    let accountsCache = {};
    const result = yield webextension_polyfill_1.default.storage.local.get(["accounts"]);
    if (result.accounts) {
        accountsCache = JSON.parse(result.accounts);
    }
    return accountsCache;
});
exports.getAccountsCache = getAccountsCache;
const storeAccounts = (accounts) => {
    webextension_polyfill_1.default.storage.local.set({
        accounts: JSON.stringify(accounts),
    });
};
exports.storeAccounts = storeAccounts;
const removeAccountFromCache = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const accountsCache = yield (0, exports.getAccountsCache)();
    if (accountsCache[id]) {
        delete accountsCache[id];
        (0, exports.storeAccounts)(accountsCache);
    }
    return accountsCache;
});
exports.removeAccountFromCache = removeAccountFromCache;
