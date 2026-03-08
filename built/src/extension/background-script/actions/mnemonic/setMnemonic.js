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
const crypto_1 = require("~/common/lib/crypto");
const mnemonic_1 = __importDefault(require("~/extension/background-script/mnemonic"));
const state_1 = __importDefault(require("../../state"));
const setMnemonic = (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = ((_a = message.args) === null || _a === void 0 ? void 0 : _a.id) || state_1.default.getState().currentAccountId;
    const password = yield state_1.default.getState().password();
    if (!password) {
        return {
            error: "Password is missing.",
        };
    }
    const mnemonic = message.args.mnemonic;
    const accounts = state_1.default.getState().accounts;
    if (id && Object.keys(accounts).includes(id)) {
        const account = accounts[id];
        account.mnemonic = mnemonic ? (0, crypto_1.encryptData)(mnemonic, password) : null;
        if (mnemonic && !account.nostrPrivateKey) {
            const nostrPrivateKey = new mnemonic_1.default(mnemonic).deriveNostrPrivateKeyHex();
            account.nostrPrivateKey = (0, crypto_1.encryptData)(nostrPrivateKey, password);
            account.hasImportedNostrKey = false;
        }
        else {
            account.hasImportedNostrKey = true;
        }
        accounts[id] = account;
        state_1.default.setState({
            accounts,
            mnemonic: null,
            bitcoin: null, // reset memoized bitcoin instance
        });
        yield state_1.default.getState().saveToStorage();
        return {
            data: {
                accountId: id,
            },
        };
    }
    return {
        error: "No account selected.",
    };
});
exports.default = setMnemonic;
