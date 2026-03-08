"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@headlessui/react");
const react_2 = require("react");
const utils_1 = require("~/app/utils");
function List({ position = "left", width = "w-56", children }) {
    return ((0, jsx_runtime_1.jsx)(react_1.Transition, { as: react_2.Fragment, enter: "transition ease-out duration-100", enterFrom: "opacity-0 scale-95", enterTo: "opacity-100 scale-100", leave: "transition ease-in duration-75", leaveFrom: "opacity-100 scale-100", leaveTo: "opacity-0 scale-95", children: (0, jsx_runtime_1.jsx)(react_1.Menu.Items, { className: (0, utils_1.classNames)(position === "left"
                ? "left-0 origin-top-left"
                : "right-0 origin-top-right", width, "absolute z-50 mt-3 overflow-hidden rounded-xl shadow-lg bg-white focus:outline-none dark:bg-surface-01dp border border-gray-200 dark:border-neutral-700"), children: children }) }));
}
exports.default = List;
