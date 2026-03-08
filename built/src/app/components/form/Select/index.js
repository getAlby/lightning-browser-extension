"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
function Select({ children, value, name, onChange }) {
    return ((0, jsx_runtime_1.jsx)("select", { className: "w-full border-gray-300 rounded-md shadow-sm text-gray-800 bg-white dark:bg-surface-00dp dark:text-neutral-200 dark:border-neutral-800", name: name, value: value, onChange: onChange, children: children }));
}
exports.default = Select;
