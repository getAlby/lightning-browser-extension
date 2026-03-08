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
const uuid_1 = require("uuid");
const crypto_1 = require("~/common/lib/crypto");
const validations_1 = require("~/common/utils/validations");
const state_1 = __importDefault(require("~/extension/background-script/state"));
const add = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const newAccount = message.args;
    const accounts = state_1.default.getState().accounts;
    const name = (0, validations_1.getUniqueAccountName)(newAccount.name, accounts);
    const tmpAccounts = Object.assign({}, accounts);
    // TODO: add validations
    // TODO: make sure a password is set
    const password = yield state_1.default.getState().password();
    if (!password)
        return { error: "Password is missing" };
    const currentAccountId = state_1.default.getState().currentAccountId;
    const accountId = (0, uuid_1.v4)();
    newAccount.config = (0, crypto_1.encryptData)(newAccount.config, password);
    tmpAccounts[accountId] = Object.assign(Object.assign({}, newAccount), { id: accountId, name, isMnemonicBackupDone: false });
    state_1.default.setState({ accounts: tmpAccounts });
    if (!currentAccountId) {
        state_1.default.setState({ currentAccountId: accountId });
    }
    // make sure we immediately persist the new account
    yield state_1.default.getState().saveToStorage();
    return { data: { accountId: accountId } };
});
exports.default = add;
