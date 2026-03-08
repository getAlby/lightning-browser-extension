"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
function Progressbar({ percentage }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "relative flex w-full items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "overflow-hidden h-2 flex-auto mr-2 rounded bg-gray-200", children: (0, jsx_runtime_1.jsx)("div", { style: { width: `${percentage}%` }, className: "shadow-none flex flex-col h-2 text-center whitespace-nowrap text-white justify-center bg-primary-gradient" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-700 font-medium dark:text-neutral-400", children: [percentage.toFixed(0), "%"] })] }));
}
exports.default = Progressbar;
