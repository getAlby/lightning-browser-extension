"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const Checkbox_1 = __importDefault(require("@components/form/Checkbox"));
const DualCurrencyField_1 = __importDefault(require("@components/form/DualCurrencyField"));
const react_1 = require("@headlessui/react");
const react_i18next_1 = require("react-i18next");
function BudgetControl({ remember, onRememberChange, budget, onBudgetChange, fiatAmount, disabled = false, }) {
    const { t } = (0, react_i18next_1.useTranslation)("components", {
        keyPrefix: "budget_control",
    });
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    return ((0, jsx_runtime_1.jsxs)("div", { className: "mb-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: `flex items-center`, children: [(0, jsx_runtime_1.jsx)(Checkbox_1.default, { id: "remember_me", name: "remember_me", checked: remember, onChange: onRememberChange, disabled: disabled }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "remember_me", className: "cursor-pointer ml-2 block text-sm text-gray-900 font-medium dark:text-white", children: t("remember.label") })] }), (0, jsx_runtime_1.jsxs)(react_1.Transition, { show: remember, enter: "transition duration-100 ease-out", enterFrom: "scale-95 opacity-0", enterTo: "scale-100 opacity-100", leave: "transition duration-75 ease-out", leaveFrom: "scale-100 opacity-100", leaveTo: "scale-95 opacity-0", children: [(0, jsx_runtime_1.jsx)("p", { className: "my-3 text-gray-500 text-sm", children: t("remember.description") }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)(DualCurrencyField_1.default, { autoFocus: true, fiatValue: fiatAmount, id: "budget", min: 0, label: t("budget.label"), placeholder: tCommon("sats", { count: 0 }), value: budget, onChange: onBudgetChange }) })] })] }));
}
exports.default = BudgetControl;
