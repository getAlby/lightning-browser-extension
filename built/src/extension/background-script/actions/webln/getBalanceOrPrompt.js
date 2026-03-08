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
const utils_1 = __importDefault(require("~/common/lib/utils"));
const db_1 = __importDefault(require("~/extension/background-script/db"));
const state_1 = __importDefault(require("~/extension/background-script/state"));
const getBalanceOrPrompt = (message) => __awaiter(void 0, void 0, void 0, function* () {
    if (!("host" in message.origin))
        return;
    const connector = yield state_1.default.getState().getConnector();
    const accountId = state_1.default.getState().currentAccountId;
    try {
        const allowance = yield db_1.default.allowances
            .where("host")
            .equalsIgnoreCase(message.origin.host)
            .first();
        if (!(allowance === null || allowance === void 0 ? void 0 : allowance.id)) {
            throw new Error("Could not find an allowance for this host");
        }
        if (!accountId) {
            // type guard
            throw new Error("Could not find a selected account");
        }
        const permission = yield db_1.default.permissions
            .where("host")
            .equalsIgnoreCase(message.origin.host)
            .and((p) => p.accountId === accountId && p.method === "webln.getbalance")
            .first();
        // request method is allowed to be called
        if (permission && permission.enabled) {
            const response = yield connector.getBalance();
            return response;
        }
        else {
            // throws an error if the user rejects
            const promptResponse = yield utils_1.default.openPrompt({
                args: {
                    requestPermission: {
                        method: "getBalance",
                        description: `webln.getbalance.description`,
                    },
                },
                origin: message.origin,
                action: "public/confirmRequestPermission",
            });
            const response = yield connector.getBalance();
            // add permission to db only if user decided to always allow this request
            if (promptResponse.data.enabled) {
                const permissionIsAdded = yield db_1.default.permissions.add({
                    createdAt: Date.now().toString(),
                    accountId: accountId,
                    allowanceId: allowance.id,
                    host: message.origin.host,
                    method: "webln.getbalance",
                    enabled: promptResponse.data.enabled,
                    blocked: promptResponse.data.blocked,
                });
                !!permissionIsAdded && (yield db_1.default.saveToStorage());
            }
            return response;
        }
    }
    catch (e) {
        console.error(e);
        return {
            error: e instanceof Error
                ? e.message
                : `Something went wrong with during webln.getBalance()`,
        };
    }
});
exports.default = getBalanceOrPrompt;
