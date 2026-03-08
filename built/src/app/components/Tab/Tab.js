"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tab = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@headlessui/react");
const index_1 = require("~/app/utils/index");
function Tab(_a) {
    var { icon, onClick, label, className } = _a, otherProps = __rest(_a, ["icon", "onClick", "label", "className"]);
    return ((0, jsx_runtime_1.jsxs)(react_1.Tab, Object.assign({}, otherProps, { onClick: onClick, className: ({ selected }) => (0, index_1.classNames)("font-bold flex px-2 py-2 justify-center items-center rounded-md focus:outline-none duration-150", selected
            ? "text-gray-700 shadow-sm dark:text-neutral-200 bg-white dark:bg-surface-16dp"
            : "text-gray-500 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600", !!className && className), children: [icon, label] })));
}
exports.Tab = Tab;
