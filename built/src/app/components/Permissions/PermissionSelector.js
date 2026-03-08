"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@popicons/react");
const react_i18next_1 = require("react-i18next");
function PermissionSelector({ i18nKey, values, onChange, }) {
    const { t } = (0, react_i18next_1.useTranslation)("components", {
        keyPrefix: "permissions_modal",
    });
    return ((0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2 justify-center items-center text-gray-400 dark:text-neutral-600 hover:text-gray-600 dark:hover:text-neutral-400 text-sm", children: [(0, jsx_runtime_1.jsx)("div", { className: "shrink-0", children: (0, jsx_runtime_1.jsx)(react_1.PopiconsShieldCheckLine, { className: "w-4 h-4" }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => onChange(), children: (0, jsx_runtime_1.jsx)(react_i18next_1.Trans, { i18nKey: i18nKey, t: t, values: values, components: [] }) })] }));
}
exports.default = PermissionSelector;
