"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const Container_1 = __importDefault(require("@components/Container"));
const TransactionsTable_1 = __importDefault(require("@components/TransactionsTable"));
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const AccountContext_1 = require("~/app/context/AccountContext");
const useTransactions_1 = require("~/app/hooks/useTransactions");
function Transactions() {
    const { t } = (0, react_i18next_1.useTranslation)("translation", {
        keyPrefix: "transactions",
    });
    const { accountLoading } = (0, AccountContext_1.useAccount)();
    const { transactions, isLoadingTransactions, loadTransactions } = (0, useTransactions_1.useTransactions)();
    const isLoading = accountLoading || isLoadingTransactions;
    (0, react_1.useEffect)(() => {
        loadTransactions();
    }, [loadTransactions]);
    return ((0, jsx_runtime_1.jsxs)(Container_1.default, { children: [(0, jsx_runtime_1.jsx)("h2", { className: "mt-12 mb-2 text-2xl font-bold dark:text-white", children: t("title") }), (0, jsx_runtime_1.jsx)("p", { className: "mb-6 text-gray-500 dark:text-neutral-500", children: t("description") }), (0, jsx_runtime_1.jsx)(TransactionsTable_1.default, { loading: isLoading, transactions: transactions })] }));
}
exports.default = Transactions;
