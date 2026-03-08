"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@popicons/react");
const dayjs_1 = __importDefault(require("dayjs"));
const nostr_tools_1 = require("nostr-tools");
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
const Hyperlink_1 = __importDefault(require("~/app/components/Hyperlink"));
const Modal_1 = __importDefault(require("~/app/components/Modal"));
const SettingsContext_1 = require("~/app/context/SettingsContext");
const utils_1 = require("~/app/utils");
function TransactionModal({ transaction, isOpen, onClose, }) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const { t } = (0, react_i18next_1.useTranslation)("components", {
        keyPrefix: "transactions_table",
    });
    const [showMoreFields, setShowMoreFields] = (0, react_2.useState)(false);
    const { getFormattedSats, getFormattedInCurrency } = (0, SettingsContext_1.useSettings)();
    function toggleShowMoreFields() {
        setShowMoreFields(!showMoreFields);
    }
    (0, react_2.useEffect)(() => {
        setShowMoreFields(false);
    }, [transaction]);
    function getTransactionType(tx) {
        return [tx.type && "sent"].includes(tx.type) ? "outgoing" : "incoming";
    }
    const metadata = transaction.metadata;
    const eventId = (_c = (_b = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.nostr) === null || _a === void 0 ? void 0 : _a.tags) === null || _b === void 0 ? void 0 : _b.find((t) => t[0] === "e")) === null || _c === void 0 ? void 0 : _c[1];
    const pubkey = (_d = metadata === null || metadata === void 0 ? void 0 : metadata.nostr) === null || _d === void 0 ? void 0 : _d.pubkey;
    const npub = pubkey ? (0, utils_1.safeNpubEncode)(pubkey) : undefined;
    return ((0, jsx_runtime_1.jsx)(Modal_1.default, { isOpen: isOpen, close: () => {
            onClose();
        }, contentLabel: "Transactions", position: "top", children: (0, jsx_runtime_1.jsxs)("div", { className: "p-3 flex flex-col gap-4 justify-center", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-center", children: getTransactionType(transaction) == "outgoing" ? (transaction.state === "pending" ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center items-center bg-blue-100 dark:bg-sky-950 rounded-full p-3 animate-pulse", children: (0, jsx_runtime_1.jsx)(react_1.PopiconsArrowUpSolid, { className: "w-10 h-10 rotate-45 text-blue-500 dark:text-sky-500 stroke-[1px] stroke-blue-500 dark:stroke-sky-500" }) })) : transaction.state === "failed" ? ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center items-center bg-red-100 dark:bg-rose-950 rounded-full p-3", children: (0, jsx_runtime_1.jsx)(react_1.PopiconsXSolid, { className: "w-10 h-10 text-red-500 dark:text-rose-500 stroke-[1px] stroke-red-500 dark:stroke-rose-500" }) })) : ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center items-center bg-orange-100 dark:bg-amber-950 rounded-full p-3", children: (0, jsx_runtime_1.jsx)(react_1.PopiconsArrowUpSolid, { className: "w-10 h-10 text-orange-500 dark:text-amber-500 stroke-[1px] stroke-orange-500 dark:stroke-amber-500" }) }))) : ((0, jsx_runtime_1.jsx)("div", { className: "flex justify-center items-center bg-green-100 dark:bg-emerald-950 rounded-full p-3", children: (0, jsx_runtime_1.jsx)(react_1.PopiconsArrowDownSolid, { className: "w-10 h-10 text-green-500 dark:text-teal-500 stroke-[1px] stroke-green-500 dark:stroke-teal-500" }) })) }), (0, jsx_runtime_1.jsx)("h2", { className: (0, utils_1.classNames)("mt-4 text-md text-gray-900 font-bold dark:text-white text-center", transaction.state == "pending" && "animate-pulse text-gray-400"), children: transaction.type == "received"
                                ? t("received")
                                : t(transaction.state === "settled"
                                    ? "sent"
                                    : transaction.state === "pending"
                                        ? "sending"
                                        : transaction.state === "failed"
                                            ? "failed"
                                            : "sent") })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center text-center justify-center dark:text-white", children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("p", { className: (0, utils_1.classNames)("text-3xl font-medium", transaction.type == "received"
                                    ? "text-green-600 dark:text-emerald-500"
                                    : transaction.state == "failed"
                                        ? "text-red-400 dark:text-rose-600"
                                        : "text-orange-600 dark:text-amber-600"), children: [transaction.type == "sent" ? "-" : "+", " ", !transaction.displayAmount
                                        ? getFormattedSats(transaction.totalAmount)
                                        : getFormattedInCurrency(transaction.displayAmount[0], transaction.displayAmount[1])] }), !!transaction.totalAmountFiat && ((0, jsx_runtime_1.jsxs)("p", { className: "text-md mt-1 text-gray-400 dark:text-neutral-500", children: ["~", transaction.totalAmountFiat] }))] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-6", children: [((_e = metadata === null || metadata === void 0 ? void 0 : metadata.recipient_data) === null || _e === void 0 ? void 0 : _e.identifier) && ((0, jsx_runtime_1.jsx)(TransactionDetailRow, { title: "To", content: metadata.recipient_data.identifier })), ((_f = metadata === null || metadata === void 0 ? void 0 : metadata.payer_data) === null || _f === void 0 ? void 0 : _f.name) && ((0, jsx_runtime_1.jsx)(TransactionDetailRow, { title: "From", content: metadata.payer_data.name })), (0, jsx_runtime_1.jsx)(TransactionDetailRow, { title: t("date_time"), content: (0, dayjs_1.default)(transaction.timestamp).format("D MMMM YYYY, HH:mm") }), ((_g = transaction.totalFees) === null || _g === void 0 ? void 0 : _g.toString) && ((0, jsx_runtime_1.jsx)(TransactionDetailRow, { title: t("fee"), content: getFormattedSats(transaction.totalFees) })), transaction.title && ((0, jsx_runtime_1.jsx)(TransactionDetailRow, { title: tCommon("description"), content: transaction.title })), (metadata === null || metadata === void 0 ? void 0 : metadata.comment) && ((0, jsx_runtime_1.jsx)(TransactionDetailRow, { title: "Comment", content: metadata.comment })), (metadata === null || metadata === void 0 ? void 0 : metadata.nostr) && eventId && npub && ((0, jsx_runtime_1.jsx)(TransactionDetailRow, { title: t("nostr_zap"), content: (0, jsx_runtime_1.jsxs)(Hyperlink_1.default, { target: "_blank", href: `https://njump.me/${nostr_tools_1.nip19.neventEncode({
                                    id: eventId,
                                })}`, rel: "noopener noreferrer", className: "flex flex-row items-center gap-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "w-full overflow-hidden whitespace-nowrap text-ellipsis", children: npub }), (0, jsx_runtime_1.jsx)(react_1.PopiconsLinkLine, { width: 16, className: "shrink-0 text-primary-foreground" })] }) })), transaction.publisherLink && transaction.title && ((0, jsx_runtime_1.jsx)(TransactionDetailRow, { title: tCommon("website"), content: (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)(Hyperlink_1.default, { target: "_blank", href: transaction.publisherLink, rel: "noopener noreferrer", children: transaction.title }) }) })), ((_h = transaction.boostagram) === null || _h === void 0 ? void 0 : _h.message) && ((0, jsx_runtime_1.jsx)(TransactionDetailRow, { title: t("boostagram.message"), content: (_j = transaction.boostagram) === null || _j === void 0 ? void 0 : _j.message })), ((_k = transaction.boostagram) === null || _k === void 0 ? void 0 : _k.podcast) && ((0, jsx_runtime_1.jsx)(TransactionDetailRow, { title: t("boostagram.podcast"), content: (_l = transaction.boostagram) === null || _l === void 0 ? void 0 : _l.podcast })), ((_m = transaction.boostagram) === null || _m === void 0 ? void 0 : _m.episode) && ((0, jsx_runtime_1.jsx)(TransactionDetailRow, { title: t("boostagram.episode"), content: transaction.boostagram.episode })), ((_o = transaction.boostagram) === null || _o === void 0 ? void 0 : _o.action) && ((0, jsx_runtime_1.jsx)(TransactionDetailRow, { title: t("boostagram.action"), content: transaction.boostagram.action })), !!((_p = transaction.boostagram) === null || _p === void 0 ? void 0 : _p.ts) && ((0, jsx_runtime_1.jsx)(TransactionDetailRow, { title: t("boostagram.timestamp"), content: transaction.boostagram.ts })), ((_q = transaction.boostagram) === null || _q === void 0 ? void 0 : _q.value_msat_total) && ((0, jsx_runtime_1.jsx)(TransactionDetailRow, { title: t("boostagram.totalAmount"), content: Math.floor(transaction.boostagram.value_msat_total / 1000) })), ((_r = transaction.boostagram) === null || _r === void 0 ? void 0 : _r.sender_name) && ((0, jsx_runtime_1.jsx)(TransactionDetailRow, { title: t("boostagram.sender"), content: transaction.boostagram.sender_name })), ((_s = transaction.boostagram) === null || _s === void 0 ? void 0 : _s.app_name) && ((0, jsx_runtime_1.jsx)(TransactionDetailRow, { title: t("boostagram.app"), content: transaction.boostagram.app_name })), (transaction.preimage || transaction.paymentHash) && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "flex justify-center mt-4", children: (0, jsx_runtime_1.jsx)(Hyperlink_1.default, { onClick: toggleShowMoreFields, children: showMoreFields ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [tCommon("actions.hide"), (0, jsx_runtime_1.jsx)(react_1.PopiconsChevronTopLine, { className: "h-4 w-4 inline-flex" })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [tCommon("actions.more"), (0, jsx_runtime_1.jsx)(react_1.PopiconsChevronBottomLine, { className: "h-4 w-4 inline-flex" })] })) }) }), showMoreFields && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-4", children: [transaction.preimage && ((0, jsx_runtime_1.jsx)(TransactionDetailRow, { title: t("preimage"), content: transaction.preimage })), transaction.paymentHash && ((0, jsx_runtime_1.jsx)(TransactionDetailRow, { title: t("payment_hash"), content: transaction.paymentHash })), metadata && ((0, jsx_runtime_1.jsx)(TransactionDetailRow, { title: t("metadata"), content: JSON.stringify(metadata, null, 2) }))] }))] }))] })] }) }));
}
exports.default = TransactionModal;
const Dt = ({ children }) => ((0, jsx_runtime_1.jsx)("dt", { className: "w-24 text-gray-400 dark:text-neutral-500 text-right", children: children }));
const Dd = ({ children }) => ((0, jsx_runtime_1.jsx)("dd", { className: "text-gray-800 dark:text-neutral-200 break-words whitespace-pre-wrap overflow-hidden", children: children }));
const TransactionDetailRow = ({ title, content, }) => ((0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-[auto,1fr] p-1 text-sm leading-5 space-x-3", children: [(0, jsx_runtime_1.jsx)(Dt, { children: title }), (0, jsx_runtime_1.jsx)(Dd, { children: content })] }));
