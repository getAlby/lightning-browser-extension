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
exports.useTransactions = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const react_1 = require("react");
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const SettingsContext_1 = require("~/app/context/SettingsContext");
const api_1 = __importDefault(require("~/common/lib/api"));
const useTransactions = () => {
    const { settings, getFormattedFiat } = (0, SettingsContext_1.useSettings)();
    const [transactions, setTransactions] = (0, react_1.useState)([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = (0, react_1.useState)(true);
    const loadTransactions = (0, react_1.useCallback)((limit) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const getTransactionsResponse = yield api_1.default.getTransactions({
                limit,
            });
            const transactions = getTransactionsResponse.transactions.map((transaction) => {
                var _a;
                return (Object.assign(Object.assign({}, transaction), { title: transaction.memo, description: ((_a = transaction.boostagram) === null || _a === void 0 ? void 0 : _a.message) || transaction.memo, timeAgo: (0, dayjs_1.default)(transaction.settleDate || transaction.creationDate).fromNow(), timestamp: transaction.settleDate || transaction.creationDate }));
            });
            for (const transaction of transactions) {
                if (transaction.displayAmount &&
                    transaction.displayAmount[1] === settings.currency)
                    continue;
                transaction.totalAmountFiat = settings.showFiat
                    ? yield getFormattedFiat(transaction.totalAmount)
                    : "";
            }
            setTransactions(transactions);
            setIsLoadingTransactions(false);
        }
        catch (e) {
            console.error(e);
            if (e instanceof Error)
                Toast_1.default.error(`Error: ${e.message}`);
        }
    }), [settings, getFormattedFiat]);
    return {
        transactions,
        isLoadingTransactions,
        loadTransactions,
    };
};
exports.useTransactions = useTransactions;
