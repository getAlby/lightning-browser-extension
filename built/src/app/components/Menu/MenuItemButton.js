"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@headlessui/react");
const index_1 = require("~/app/utils/index");
function MenuItemButton({ children, disabled = false, onClick, title = "", }) {
    return ((0, jsx_runtime_1.jsx)(react_1.Menu.Item, { children: ({ active }) => ((0, jsx_runtime_1.jsx)("button", { className: (0, index_1.classNames)(active ? "bg-gray-50 dark:bg-surface-02dp" : "", disabled ? "cursor-not-allowed" : "cursor-pointer", "flex items-center w-full p-4 text-sm text-gray-800 dark:text-neutral-200 whitespace-nowrap"), disabled: disabled, onClick: onClick, title: title, children: children })) }));
}
exports.default = MenuItemButton;
