"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
function ScreenHeader({ title }) {
    return ((0, jsx_runtime_1.jsx)("div", { className: "text-center text-lg font-semibold dark:text-white py-2 border-b border-gray-200 dark:border-neutral-700", children: title }));
}
exports.default = ScreenHeader;
