"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@popicons/react");
const utils_1 = require("~/app/utils");
function Badge({ label, className, onDelete, description, }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.classNames)("inline-flex items-center leading-none rounded-full font-medium py-1.5 px-2 text-xs cursor-default", className), title: description, children: [label.toUpperCase(), onDelete && ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => {
                    onDelete();
                }, className: "text-gray-400 dark:text-neutral-600 hover:text-gray-600 dark:hover:text-neutral-400", children: (0, jsx_runtime_1.jsx)(react_1.PopiconsXLine, { className: "w-4 h-4" }) }))] }));
}
exports.default = Badge;
