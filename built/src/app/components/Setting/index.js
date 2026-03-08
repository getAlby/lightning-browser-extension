"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const utils_1 = require("~/app/utils");
function Setting({ title, subtitle, children, inline }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.classNames)(inline ? "" : "flex-col sm:flex-row", "flex justify-between py-4"), children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-800 dark:text-white font-medium", children: title }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 mr-1 dark:text-neutral-400 text-sm", children: subtitle })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center", children: children })] }));
}
exports.default = Setting;
