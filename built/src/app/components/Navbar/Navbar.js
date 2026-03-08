"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const AccountMenu_1 = __importDefault(require("../AccountMenu"));
const UserMenu_1 = __importDefault(require("../UserMenu"));
function Navbar({ children }) {
    return ((0, jsx_runtime_1.jsx)("div", { className: "py-[6px] bg-white border-b border-gray-200 dark:bg-surface-01dp dark:border-neutral-700 whitespace-nowrap", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-screen-lg px-4 flex justify-between items-center mx-auto w-full", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)(UserMenu_1.default, {}), children && ((0, jsx_runtime_1.jsx)("nav", { className: "ml-8 space-x-8 hidden md:flex", children: children }))] }), (0, jsx_runtime_1.jsx)(AccountMenu_1.default, {})] }) }));
}
exports.default = Navbar;
