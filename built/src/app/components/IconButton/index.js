"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
function IconButton({ onClick, icon }) {
    return ((0, jsx_runtime_1.jsx)("button", { className: "flex justify-center items-center w-8 h-8 dark:text-white rounded-md border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-surface-08dp transition-colors duration-200", onClick: onClick, children: icon }));
}
exports.default = IconButton;
