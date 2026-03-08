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
const state_1 = __importDefault(require("../../state"));
const changePassword = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const accounts = state_1.default.getState().accounts;
    const password = yield state_1.default.getState().password();
    if (!password)
        return { error: "Password is missing" };
    const newPassword = message.args.password;
    const tmpAccounts = Object.assign({}, accounts);
    for (const accountId in tmpAccounts) {
        const accountConfig = (0, crypto_1.decryptData)(accounts[accountId].config, password);
        tmpAccounts[accountId].config = (0, crypto_1.encryptData)(accountConfig, newPassword);
        // Re-encrypt nostr key with the new password
        if (accounts[accountId].nostrPrivateKey) {
            const accountNostrKey = (0, crypto_1.decryptData)(accounts[accountId].nostrPrivateKey, password);
            tmpAccounts[accountId].nostrPrivateKey = (0, crypto_1.encryptData)(accountNostrKey, newPassword);
        }
        // Re-encrypt mnemonic with the new password
        if (accounts[accountId].mnemonic) {
            const accountMnemonic = (0, crypto_1.decryptData)(accounts[accountId].mnemonic, password);
            tmpAccounts[accountId].mnemonic = (0, crypto_1.encryptData)(accountMnemonic, newPassword);
        }
    }
    yield state_1.default.getState().password(newPassword);
    state_1.default.setState({ accounts: tmpAccounts });
    // make sure we immediately persist the updated accounts
    yield state_1.default.getState().saveToStorage();
    return {};
});
exports.default = changePassword;
