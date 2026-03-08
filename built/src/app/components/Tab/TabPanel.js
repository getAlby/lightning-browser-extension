"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@headlessui/react");
const index_1 = require("~/app/utils/index");
function TabPanel({ children, className }) {
    return ((0, jsx_runtime_1.jsx)(react_1.Tab.Panel, { className: (0, index_1.classNames)(!!className && className), children: children }));
}
exports.default = TabPanel;
