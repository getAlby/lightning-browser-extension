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
const get = (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = ((_a = message === null || message === void 0 ? void 0 : message.args) === null || _a === void 0 ? void 0 : _a.id) || state_1.default.getState().currentAccountId;
    if (!id)
        return {
            error: "No account selected.",
        };
    const accounts = state_1.default.getState().accounts;
    const account = accounts[id];
    if (!account)
        return;
    const result = {
        id: account.id,
        connectorType: account.connector,
        name: account.name,
        liquidEnabled: !!account.mnemonic,
        nostrEnabled: !!account.nostrPrivateKey,
        hasMnemonic: !!account.mnemonic,
        // for existing accounts consider mnemonic backup already done
        isMnemonicBackupDone: account.isMnemonicBackupDone !== undefined
            ? account.isMnemonicBackupDone
            : true,
        // Note: undefined (default for new accounts) it is also considered imported
        hasImportedNostrKey: account.hasImportedNostrKey !== false,
        bitcoinNetwork: account.bitcoinNetwork || "bitcoin",
        hasSeenInfoBanner: account.hasSeenInfoBanner || false,
        useMnemonicForLnurlAuth: account.useMnemonicForLnurlAuth || false,
    };
    return {
        data: result,
    };
});
exports.default = get;
