"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_i18next_1 = require("react-i18next");
const SettingsContext_1 = require("~/app/context/SettingsContext");
const PaymentSummary = ({ amount, description, fiatAmount }) => {
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    const { getFormattedSats } = (0, SettingsContext_1.useSettings)();
    return ((0, jsx_runtime_1.jsxs)("dl", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(Dt, { children: tCommon("amount") }), (0, jsx_runtime_1.jsx)(Dd, { children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-row justify-between", children: [(0, jsx_runtime_1.jsx)("div", { children: getFormattedSats(amount) }), !!fiatAmount && ((0, jsx_runtime_1.jsxs)("span", { "data-testid": "fiat_amount", children: ["~", fiatAmount] }))] }) })] }), !!description && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)(Dt, { children: tCommon("description") }), (0, jsx_runtime_1.jsx)(Dd, { children: description })] }))] }));
};
const Dt = ({ children }) => ((0, jsx_runtime_1.jsx)("dt", { className: "text-sm font-medium text-gray-800 dark:text-neutral-200", children: children }));
const Dd = ({ children }) => ((0, jsx_runtime_1.jsx)("dd", { className: "text-lg text-gray-600 dark:text-neutral-400 break-words", children: children }));
exports.default = PaymentSummary;
