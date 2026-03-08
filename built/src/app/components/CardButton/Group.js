"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
function CardButtonGroup({ children }) {
    return (0, jsx_runtime_1.jsx)("div", { className: "flex flex-col sm:flex-row gap-5", children: children });
}
exports.default = CardButtonGroup;
