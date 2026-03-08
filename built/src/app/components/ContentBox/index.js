"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentBox = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
function ContentBox({ children }) {
    return ((0, jsx_runtime_1.jsx)("div", { className: "mt-6 bg-white rounded-2xl p-10 border border-gray-200 dark:border-neutral-700 dark:bg-surface-01dp flex flex-col gap-8", children: children }));
}
exports.ContentBox = ContentBox;
