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
const state_1 = __importDefault(require("~/extension/background-script/state"));
const remove = (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const accounts = state_1.default.getState().accounts;
    let currentAccountId = state_1.default.getState().currentAccountId;
    let accountId = (_a = message === null || message === void 0 ? void 0 : message.args) === null || _a === void 0 ? void 0 : _a.id;
    // if no account is specified, remove the current account
    if (!accountId && currentAccountId !== null) {
        accountId = currentAccountId;
    }
    if (typeof accountId === "string" || typeof accountId === "number") {
        delete accounts[accountId];
        state_1.default.setState({ accounts });
        const accountsUpdated = state_1.default.getState().accounts;
        const accountIds = Object.keys(accountsUpdated);
        // if the current account gets removed we select a new "current account"
        if (accountId === currentAccountId && accountIds.length > 0) {
            currentAccountId = accountIds[0];
            state_1.default.setState({ currentAccountId });
        }
        // make sure we immediately persist the updated accounts
        yield state_1.default.getState().saveToStorage();
        return {
            data: { removed: accountId },
        };
    }
    else {
        return {
            error: `Account not found: ${accountId}`,
        };
    }
});
exports.default = remove;
