"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
function TestConnectionResultCard({ alias, accountName, satoshis, fiat, color, currency, }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: `${color} rounded-lg p-5 dark:bg-gray-600 text-black dark:text-white`, children: [(0, jsx_runtime_1.jsx)("p", { className: "break-words", children: accountName }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs break-words", children: alias }), (0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-bold mt-2", children: satoshis }), fiat && currency && ((0, jsx_runtime_1.jsxs)("p", { className: "text-white mt-1", children: [fiat, " ", currency] }))] }));
}
exports.default = TestConnectionResultCard;
