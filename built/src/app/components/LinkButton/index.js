"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_dom_1 = require("react-router-dom");
function LinkButton({ to, title, logo }) {
    return ((0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: to, children: (0, jsx_runtime_1.jsxs)("div", { className: "p-10 h-72 border border-gray-200 dark:border-neutral-700 bg-white dark:bg-surface-02dp text-center overflow-hidden rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition duration-200 flex flex-col justify-center space-y-4", children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("img", { src: logo, alt: "logo", className: "inline rounded-3xl w-32 mb-6" }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("span", { className: "block dark:text-white text-lg font-medium", children: title }) })] }) }));
}
exports.default = LinkButton;
