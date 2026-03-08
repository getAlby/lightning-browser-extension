"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
function ConnectorPath({ title, icon, description, actions }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "text-gray-600 dark:text-neutral-400 flex flex-col p-8 border border-gray-200 dark:border-neutral-700 rounded-2xl bg-white dark:bg-surface-02dp", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row items-center mb-4 space-x-3", children: [icon, (0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-bold dark:text-white text-center", children: title })] }), (0, jsx_runtime_1.jsx)("p", { className: "mb-8", children: description }), (0, jsx_runtime_1.jsx)("div", { className: "flex gap-4 flex-col sm:flex-row mt-auto", children: actions })] }));
}
exports.default = ConnectorPath;
