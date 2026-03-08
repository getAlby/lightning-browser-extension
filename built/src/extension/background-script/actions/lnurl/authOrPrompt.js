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
const pubsub_js_1 = __importDefault(require("pubsub-js"));
const utils_1 = __importDefault(require("~/common/lib/utils"));
const helpers_1 = require("~/common/utils/helpers");
const db_1 = __importDefault(require("~/extension/background-script/db"));
const state_1 = __importDefault(require("~/extension/background-script/state"));
const auth_1 = require("./auth");
function authOrPrompt(message, sender, lnurlDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        const host = (0, helpers_1.getHostFromSender)(sender);
        if (!host)
            return;
        if (!("host" in message.origin))
            return;
        pubsub_js_1.default.publish(`lnurl.auth.start`, { message, lnurlDetails });
        // get the publisher to check if lnurlAuth for auto-login is enabled
        const allowance = yield db_1.default.allowances
            .where("host")
            .equalsIgnoreCase(host)
            .first();
        // we have the check the unlock status manually. The account can still be locked
        // If it is locked we must show a prompt to unlock
        const isUnlocked = yield state_1.default.getState().isUnlocked();
        const account = yield state_1.default.getState().getAccount();
        function authPrompt() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const promptMessage = Object.assign(Object.assign({}, message), { action: "lnurlAuth", args: Object.assign(Object.assign({}, message.args), { lnurlDetails }) });
                    const response = yield utils_1.default.openPrompt(promptMessage);
                    return response;
                }
                catch (e) {
                    // user rejected
                    return { error: e instanceof Error ? e.message : e };
                }
            });
        }
        // check if there is a publisher and lnurlAuth is enabled,
        // otherwise we we prompt the user
        if (isUnlocked &&
            allowance &&
            allowance.enabled &&
            allowance.lnurlAuth &&
            (!(account === null || account === void 0 ? void 0 : account.useMnemonicForLnurlAuth) || (account === null || account === void 0 ? void 0 : account.mnemonic))) {
            return yield (0, auth_1.authFunction)({ lnurlDetails, origin: message.origin });
        }
        return yield authPrompt();
    });
}
exports.default = authOrPrompt;
