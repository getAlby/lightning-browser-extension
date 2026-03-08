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
const edit = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const accounts = state_1.default.getState().accounts;
    const accountId = message.args.id;
    if (accountId in accounts) {
        if (message.args.name) {
            accounts[accountId].name = message.args.name;
        }
        if (message.args.bitcoinNetwork) {
            accounts[accountId].bitcoinNetwork = message.args.bitcoinNetwork;
            state_1.default.setState({
                bitcoin: null,
                liquid: null, // reset memoized liquid state
            });
        }
        if (message.args.useMnemonicForLnurlAuth !== undefined) {
            accounts[accountId].useMnemonicForLnurlAuth =
                message.args.useMnemonicForLnurlAuth;
        }
        if (message.args.isMnemonicBackupDone !== undefined) {
            accounts[accountId].isMnemonicBackupDone =
                message.args.isMnemonicBackupDone;
        }
        if (message.args.hasSeenInfoBanner !== undefined) {
            accounts[accountId].hasSeenInfoBanner = message.args.hasSeenInfoBanner;
        }
        state_1.default.setState({ accounts });
        // make sure we immediately persist the updated accounts
        yield state_1.default.getState().saveToStorage();
        return {};
    }
    else {
        return {
            error: `Account not found: ${accountId}`,
        };
    }
});
exports.default = edit;
