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
// TODO: move checkAllowance to some helpers/models?
const helpers_1 = require("~/common/utils/helpers");
const keysend_1 = __importDefault(require("../ln/keysend"));
const sendPaymentOrPrompt_1 = require("./sendPaymentOrPrompt");
const keysendOrPrompt = (message, sender) => __awaiter(void 0, void 0, void 0, function* () {
    const host = (0, helpers_1.getHostFromSender)(sender);
    if (!host)
        return;
    const destination = message.args.destination;
    const amount = message.args.amount;
    if (typeof destination !== "string" ||
        (typeof amount !== "string" && typeof amount !== "number")) {
        return {
            error: "Destination or amount missing.",
        };
    }
    if (yield (0, sendPaymentOrPrompt_1.checkAllowance)(host, parseInt(amount))) {
        return keysendWithAllowance(message);
    }
    else {
        return keysendWithPrompt(message);
    }
});
function keysendWithAllowance(message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield (0, keysend_1.default)(message);
            return response;
        }
        catch (e) {
            console.error(e);
            if (e instanceof Error) {
                return { error: e.message };
            }
        }
    });
}
function keysendWithPrompt(message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield utils_1.default.openPrompt(Object.assign(Object.assign({}, message), { action: "confirmKeysend" }));
            return response;
        }
        catch (e) {
            console.error("Payment cancelled", e);
            if (e instanceof Error) {
                return { error: e.message };
            }
        }
    });
}
exports.default = keysendOrPrompt;
