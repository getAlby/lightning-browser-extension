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
const utils_1 = __importDefault(require("../../../../common/lib/utils"));
const makeInvoiceOrPrompt = (message) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: support to remember the prompt decision and allow auto-create invoices
    return makeInvoiceWithPrompt(message);
});
const makeInvoiceWithPrompt = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const amount = message.args.amount || message.args.defaultAmount;
    const memo = message.args.memo || message.args.defaultMemo;
    const amountEditable = !message.args.amount;
    const memoEditable = !message.args.memo || message.args.memo === "";
    // If amount is not defined yet, let the user generate an invoice with an amount field.
    try {
        const response = yield utils_1.default.openPrompt({
            origin: message.origin,
            action: "makeInvoice",
            args: {
                amountEditable,
                memoEditable,
                invoiceAttributes: {
                    amount,
                    memo,
                    minimumAmount: message.args.minimumAmount,
                    maximumAmount: message.args.maximumAmount,
                },
            },
        });
        return response;
    }
    catch (e) {
        return { error: e instanceof Error ? e.message : e };
    }
});
exports.default = makeInvoiceOrPrompt;
