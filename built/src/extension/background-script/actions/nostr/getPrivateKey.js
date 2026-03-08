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
const getPrivateKey = (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = (_a = message === null || message === void 0 ? void 0 : message.args) === null || _a === void 0 ? void 0 : _a.id;
    if (!id) {
        return {
            data: (yield state_1.default.getState().getNostr()).privateKey,
        };
    }
    const accounts = state_1.default.getState().accounts;
    if (Object.keys(accounts).includes(id)) {
        const password = yield state_1.default.getState().password();
        if (!password) {
            return {
                error: "Password is missing.",
            };
        }
        const account = accounts[id];
        if (!account.nostrPrivateKey)
            return { data: null };
        const privateKey = (0, crypto_1.decryptData)(account.nostrPrivateKey, password);
        return {
            data: privateKey,
        };
    }
    return {
        error: "Account does not exist.",
    };
});
exports.default = getPrivateKey;
