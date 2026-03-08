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
const nostr_1 = __importDefault(require("~/common/lib/nostr"));
const mnemonic_1 = __importDefault(require("~/extension/background-script/mnemonic"));
const state_1 = __importDefault(require("../../state"));
const setPrivateKey = (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = ((_a = message.args) === null || _a === void 0 ? void 0 : _a.id) || state_1.default.getState().currentAccountId;
    const password = yield state_1.default.getState().password();
    if (!password) {
        return {
            error: "Password is missing.",
        };
    }
    // make sure private key is saved in hex format
    let privateKey;
    try {
        privateKey = nostr_1.default.normalizeToHex(message.args.privateKey);
        // Validate the private key before saving
        nostr_1.default.derivePublicKey(privateKey);
        nostr_1.default.hexToNip19(privateKey, "nsec");
    }
    catch (error) {
        return {
            error: "Invalid private key",
        };
    }
    const accounts = state_1.default.getState().accounts;
    if (id && Object.keys(accounts).includes(id)) {
        const account = accounts[id];
        account.nostrPrivateKey = privateKey
            ? (0, crypto_1.encryptData)(privateKey, password)
            : null;
        account.hasImportedNostrKey =
            !account.mnemonic ||
                new mnemonic_1.default((0, crypto_1.decryptData)(account.mnemonic, password)).deriveNostrPrivateKeyHex() !== privateKey;
        accounts[id] = account;
        state_1.default.setState({
            accounts,
            nostr: null, // reset memoized nostr instance
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
exports.default = setPrivateKey;
