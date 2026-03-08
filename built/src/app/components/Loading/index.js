"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_i18next_1 = require("react-i18next");
function Loading({ color = "currentColor" }) {
    const { t: tCommon } = (0, react_i18next_1.useTranslation)("common");
    return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("svg", { className: "animate-spin-fast h-5 w-5 text-blue-600", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [(0, jsx_runtime_1.jsx)("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: color, strokeWidth: "4" }), (0, jsx_runtime_1.jsx)("path", { fill: color, d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), (0, jsx_runtime_1.jsxs)("span", { className: "sr-only", children: [tCommon("loading"), "..."] })] }));
}
exports.default = Loading;
