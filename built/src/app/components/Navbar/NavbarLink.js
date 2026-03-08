"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_dom_1 = require("react-router-dom");
const utils_1 = require("~/app/utils");
function NavbarLink({ children, end = false, href, target }) {
    return ((0, jsx_runtime_1.jsx)(react_router_dom_1.NavLink, { end: end, to: href, target: target, className: ({ isActive }) => (0, utils_1.classNames)("flex items-center font-semibold hover:text-gray-600 dark:hover:text-neutral-400 transition px-1 text-md", isActive
            ? "text-gray-800 dark:text-neutral-200"
            : "text-gray-400 dark:text-neutral-600"), children: children }));
}
exports.default = NavbarLink;
