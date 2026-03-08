"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
function Header({ children, headerLeft, headerRight }) {
    return ((0, jsx_runtime_1.jsx)("div", { className: "bg-white py-[6px] border-b border-gray-200 dark:bg-surface-01dp dark:border-neutral-700", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center container max-w-screen-lg px-4 mx-auto", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 mr-3", children: headerLeft }), (0, jsx_runtime_1.jsx)("h1", { className: "text-lg font-medium dark:text-white overflow-hidden", children: children }), (0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 ml-3", children: headerRight })] }) }));
}
exports.default = Header;
