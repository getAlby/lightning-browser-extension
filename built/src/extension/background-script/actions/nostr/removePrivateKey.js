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
const state_1 = __importDefault(require("../../state"));
const removePrivateKey = (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = ((_a = message.args) === null || _a === void 0 ? void 0 : _a.id) || state_1.default.getState().currentAccountId;
    const accounts = state_1.default.getState().accounts;
    if (id && Object.keys(accounts).includes(id)) {
        const account = accounts[id];
        if (account.nostrPrivateKey)
            delete account.nostrPrivateKey;
        account.hasImportedNostrKey = true;
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
exports.default = removePrivateKey;
