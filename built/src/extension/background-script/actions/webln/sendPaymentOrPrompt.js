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
exports.sendPaymentOrPrompt = exports.payWithPrompt = exports.checkAllowance = void 0;
const bolt11_signet_1 = __importDefault(require("bolt11-signet"));
const utils_1 = __importDefault(require("~/common/lib/utils"));
const helpers_1 = require("~/common/utils/helpers");
const db_1 = __importDefault(require("../../db"));
const sendPayment_1 = __importDefault(require("../ln/sendPayment"));
const sendPaymentOrPrompt = (message, sender) => __awaiter(void 0, void 0, void 0, function* () {
    const host = (0, helpers_1.getHostFromSender)(sender);
    if (!host)
        return;
    const paymentRequest = message.args.paymentRequest;
    if (typeof paymentRequest !== "string") {
        return {
            error: "Payment request missing.",
        };
    }
    const paymentRequestDetails = bolt11_signet_1.default.decode(paymentRequest);
    if (yield checkAllowance(host, paymentRequestDetails.satoshis || 0)) {
        return sendPaymentWithAllowance(message);
    }
    else {
        return payWithPrompt(message);
    }
});
exports.sendPaymentOrPrompt = sendPaymentOrPrompt;
function checkAllowance(host, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const allowance = yield db_1.default.allowances
            .where("host")
            .equalsIgnoreCase(host)
            .first();
        return allowance && allowance.remainingBudget > amount; // check that the budget is higher than the amount. amount can be 0
    });
}
exports.checkAllowance = checkAllowance;
function sendPaymentWithAllowance(message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield (0, sendPayment_1.default)(message);
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
function payWithPrompt(message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield utils_1.default.openPrompt(Object.assign(Object.assign({}, message), { action: "confirmPayment" }));
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
exports.payWithPrompt = payWithPrompt;
