"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@headlessui/react");
const index_1 = require("~/app/utils/index");
function TabList({ children, className }) {
    return ((0, jsx_runtime_1.jsx)(react_1.Tab.List, { className: (0, index_1.classNames)("grid grid-flow-col gap-1 text-center rounded-md mb-2 bg-gray-100 dark:bg-surface-02dp p-1", !!className && className), children: children }));
}
exports.default = TabList;
