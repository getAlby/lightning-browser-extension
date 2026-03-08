"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const Loading_1 = __importDefault(require("@components/Loading"));
const react_1 = require("@popicons/react");
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const TransactionModal_1 = __importDefault(require("~/app/components/TransactionsTable/TransactionModal"));
const SettingsContext_1 = require("~/app/context/SettingsContext");
const utils_1 = require("~/app/utils");
function TransactionsTable({ transactions, loading = false, }) {
    const { getFormattedSats, getFormattedInCurrency } = (0, SettingsContext_1.useSettings)();
    const [modalOpen, setModalOpen] = (0, react_2.useState)(false);
    const [transaction, setTransaction] = (0, react_2.useState)();
    const { t } = (0, react_i18next_1.useTranslation)("components", {
        keyPrefix: "transactions_table",
    });
    function openDetails(transaction) {
        setTransaction(transaction);
        setModalOpen(true);
    }
    function getTransactionType(tx) {
        return [tx.type && "sent"].includes(tx.type) ? "outgoing" : "incoming";
    }
    return ((0, jsx_runtime_1.jsx)("div", { children: loading ? ((0, jsx_runtime_1.jsx)("div", { className: "w-full flex flex-col items-center", children: (0, jsx_runtime_1.jsx)(Loading_1.default, {}) })) : !(transactions === null || transactions === void 0 ? void 0 : transactions.length) ? ((0, jsx_runtime_1.jsx)("p", { className: "text-gray-500 dark:text-neutral-400 text-center", children: t("no_transactions") })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [transactions === null || transactions === void 0 ? void 0 : transactions.map((tx) => {
                    var _a, _b, _c;
                    const type = getTransactionType(tx);
                    const typeStateText = type == "incoming"
                        ? t("received")
                        : t(tx.state === "settled"
                            ? "sent"
                            : tx.state === "pending"
                                ? "sending"
                                : tx.state === "failed"
                                    ? "failed"
                                    : "sent");
                    const metadata = tx.metadata;
                    const payerName = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.payer_data) === null || _a === void 0 ? void 0 : _a.name;
                    const pubkey = (_b = metadata === null || metadata === void 0 ? void 0 : metadata.nostr) === null || _b === void 0 ? void 0 : _b.pubkey;
                    const npub = pubkey ? (0, utils_1.safeNpubEncode)(pubkey) : undefined;
                    const from = payerName
                        ? `from ${payerName}`
                        : npub
                            ? `zap from ${npub.substring(0, 12)}...`
                            : undefined;
                    const recipientIdentifier = (_c = metadata === null || metadata === void 0 ? void 0 : metadata.recipient_data) === null || _c === void 0 ? void 0 : _c.identifier;
                    const to = recipientIdentifier
                        ? `${tx.state === "failed" ? "payment " : ""}to ${recipientIdentifier}`
                        : undefined;
                    return ((0, jsx_runtime_1.jsx)("div", { className: "-mx-2 px-2 py-2 hover:bg-gray-100 dark:hover:bg-surface-02dp cursor-pointer rounded-md", onClick: () => openDetails(tx), children: (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3 items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-center", children: type == "outgoing" ? (tx.state === "pending" ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center items-center bg-blue-100 dark:bg-sky-950 rounded-full w-8 h-8 animate-pulse", children: (0, jsx_runtime_1.jsx)(react_1.PopiconsArrowUpSolid, { className: "w-5 h-5 rotate-45 text-blue-500 dark:text-sky-500 stroke-[1px] stroke-blue-500 dark:stroke-sky-500" }) })) : tx.state === "failed" ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center items-center bg-red-100 dark:bg-rose-950 rounded-full w-8 h-8", children: (0, jsx_runtime_1.jsx)(react_1.PopiconsXSolid, { className: "w-5 h-5 text-red-500 dark:text-rose-500 stroke-[1px] stroke-red-500 dark:stroke-rose-500" }) })) : ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center items-center bg-orange-100 dark:bg-amber-950 rounded-full w-8 h-8", children: (0, jsx_runtime_1.jsx)(react_1.PopiconsArrowUpSolid, { className: "w-5 h-5 text-orange-500 dark:text-amber-500 stroke-[1px] stroke-orange-500 dark:stroke-amber-500" }) }))) : ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center items-center bg-green-100 dark:bg-emerald-950 rounded-full w-8 h-8", children: (0, jsx_runtime_1.jsx)(react_1.PopiconsArrowDownSolid, { className: "w-5 h-5 text-green-500 dark:text-teal-500 stroke-[1px] stroke-green-500 dark:stroke-teal-500" }) })) }), (0, jsx_runtime_1.jsxs)("div", { className: "overflow-hidden mr-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 text-sm font-medium text-black truncate dark:text-white items-center", children: [(0, jsx_runtime_1.jsxs)("p", { className: (0, utils_1.classNames)("truncate", tx.state == "pending" && "animate-pulse"), children: [typeStateText, from !== undefined && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["\u00A0", from] }), to !== undefined && (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: ["\u00A0", to] })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-gray-400 dark:text-neutral-500", children: tx.timeAgo })] }), (tx.description || (metadata === null || metadata === void 0 ? void 0 : metadata.comment)) && ((0, jsx_runtime_1.jsx)("p", { className: "truncate text-xs text-gray-600 dark:text-neutral-400", children: tx.description || (metadata === null || metadata === void 0 ? void 0 : metadata.comment) }))] }), (0, jsx_runtime_1.jsx)("div", { className: "flex ml-auto text-right space-x-3 shrink-0 dark:text-white", children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("p", { className: (0, utils_1.classNames)("text-sm", type == "incoming"
                                                    ? "text-green-600 dark:text-emerald-500"
                                                    : tx.state == "failed"
                                                        ? "text-red-600 dark:text-rose-500"
                                                        : "text-orange-600 dark:text-amber-600"), children: [type == "outgoing" ? "-" : "+", " ", !tx.displayAmount
                                                        ? getFormattedSats(tx.totalAmount)
                                                        : getFormattedInCurrency(tx.displayAmount[0], tx.displayAmount[1])] }), !!tx.totalAmountFiat && ((0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-gray-400 dark:text-neutral-600", children: ["~", tx.totalAmountFiat] }))] }) })] }) }, tx.id));
                }), transaction && ((0, jsx_runtime_1.jsx)(TransactionModal_1.default, { transaction: transaction, isOpen: modalOpen, onClose: () => {
                        setModalOpen(false);
                    } }))] })) }));
}
exports.default = TransactionsTable;
