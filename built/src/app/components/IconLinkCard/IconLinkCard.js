"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IconLinkCard = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@popicons/react");
function IconLinkCard({ icon, title, description, onClick, }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "border border-gray-200 dark:border-neutral-800 rounded-xl p-4 bg-white dark:bg-surface-01dp hover:bg-gray-50 dark:hover:bg-surface-02dp text-gray-800 dark:text-neutral-200 cursor-pointer flex flex-row items-center gap-3", onClick: onClick, children: [(0, jsx_runtime_1.jsx)("div", { className: "flex-shrink-0 flex justify-center md:px-3 text-gray-400 dark:text-neutral-600", children: icon }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-grow space-y-0.5", children: [(0, jsx_runtime_1.jsx)("div", { className: "font-medium leading-5 text-sm md:text-base", children: title }), (0, jsx_runtime_1.jsx)("div", { className: "text-gray-600 dark:text-neutral-400 text-xs leading-4 md:text-sm", children: description })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex-shrink-0 flex justify-end text-gray-400 dark:text-neutral-600 ", children: (0, jsx_runtime_1.jsx)(react_1.PopiconsChevronRightLine, { className: "w-5" }) })] }));
}
exports.IconLinkCard = IconLinkCard;
