"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_i18next_1 = require("react-i18next");
function SuccessMessage({ message, onClose }) {
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("dl", { className: "shadow bg-white dark:bg-surface-02dp pt-4 px-4 rounded-lg mb-6 overflow-hidden", children: [(0, jsx_runtime_1.jsx)("dt", { className: "text-sm font-semibold text-gray-500", children: tCommon("success") }), (0, jsx_runtime_1.jsx)("dd", { className: "text-sm mb-4 dark:text-white break-all", children: message })] }), (0, jsx_runtime_1.jsx)("div", { className: "text-center", children: (0, jsx_runtime_1.jsx)("button", { className: "underline text-sm text-gray-500", onClick: onClose, children: tCommon("actions.close") }) })] }));
}
exports.default = SuccessMessage;
