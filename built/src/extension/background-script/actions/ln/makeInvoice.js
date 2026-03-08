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
const state_1 = __importDefault(require("../../state"));
const makeInvoice = (message) => __awaiter(void 0, void 0, void 0, function* () {
    pubsub_js_1.default.publish(`ln.makeInvoice.start`, message);
    let amount;
    const memo = message.args.memo || message.args.defaultMemo || "Alby invoice";
    if (message.args.amount) {
        amount = parseInt(message.args.amount);
        const connector = yield state_1.default.getState().getConnector();
        try {
            const response = yield connector.makeInvoice({
                amount,
                memo,
            });
            return response;
        }
        catch (e) {
            if (e instanceof Error) {
                return { error: e.message };
            }
        }
    }
    else {
        // If amount is not defined yet, let the user generate an invoice with an amount field.
        return yield utils_1.default.openPrompt(Object.assign(Object.assign({}, message), { action: "makeInvoice", args: {
                invoiceAttributes: Object.assign({}, message.args),
            } }));
    }
});
exports.default = makeInvoice;
