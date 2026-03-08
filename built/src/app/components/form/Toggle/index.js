"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@headlessui/react");
const index_1 = require("~/app/utils/index");
function Toggle({ checked, disabled, onChange }) {
    return ((0, jsx_runtime_1.jsx)(react_1.Switch, { disabled: disabled, checked: checked, onChange: onChange, className: (0, index_1.classNames)(checked ? "bg-primary-gradient" : "bg-gray-300 dark:bg-surface-00dp", "relative inline-flex bg-origin-border shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"), children: (0, jsx_runtime_1.jsx)("span", { "aria-hidden": "true", className: (0, index_1.classNames)(checked ? "translate-x-5" : "translate-x-0", "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition ease-in-out duration-200") }) }));
}
exports.default = Toggle;
