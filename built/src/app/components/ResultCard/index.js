"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
function ResultCard({ message, isSuccess }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "p-12 font-medium drop-shadow rounded-lg mt-4 flex flex-col items-center bg-white dark:bg-surface-02dp", children: [(0, jsx_runtime_1.jsx)("img", { src: isSuccess ? "assets/icons/tick.svg" : "assets/icons/cross.svg", alt: isSuccess ? "success" : "failure", className: "mb-8" }), (0, jsx_runtime_1.jsx)("p", { className: "text-center dark:text-white w-full text-ellipsis line-clamp-3", children: message })] }));
}
exports.default = ResultCard;
