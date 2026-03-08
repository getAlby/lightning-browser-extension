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
const info = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const connector = yield state_1.default.getState().getConnector();
    const currentAccountId = state_1.default.getState().currentAccountId;
    const currentAccount = state_1.default.getState().getAccount();
    const info = yield connector.getInfo();
    const balance = yield connector.getBalance();
    if (!currentAccount || !currentAccountId) {
        return { error: "No current account set" };
    }
    const result = {
        currentAccountId: currentAccountId,
        name: currentAccount.name,
        avatarUrl: currentAccount.avatarUrl,
        info: info.data,
        connectorType: currentAccount.connector,
        balance: {
            balance: balance.data.balance,
            currency: balance.data.currency || "BTC", // set default currency for every account
        },
    };
    return {
        data: result,
    };
});
exports.default = info;
