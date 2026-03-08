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
const state_1 = __importDefault(require("~/extension/background-script/state"));
const getTransactions = (message) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = message.args.limit;
    const connector = yield state_1.default.getState().getConnector();
    try {
        const result = yield connector.getTransactions();
        let transactions = result.data.transactions.map((transaction) => {
            const boostagram = utils_1.default.getBoostagramFromInvoiceCustomRecords(transaction.custom_records);
            return Object.assign(Object.assign({}, transaction), { boostagram, paymentHash: transaction.payment_hash });
        });
        if (limit) {
            transactions = transactions.slice(0, limit);
        }
        return {
            data: {
                transactions,
            },
        };
    }
    catch (e) {
        console.error(e);
        if (e instanceof Error) {
            return { error: e.message };
        }
    }
});
exports.default = getTransactions;
