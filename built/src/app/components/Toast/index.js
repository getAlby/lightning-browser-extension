"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@headlessui/react");
const react_2 = require("@popicons/react");
const react_hot_toast_1 = require("react-hot-toast");
const toast = {
    success: (message, options) => {
        toast.custom(message, "success", options);
    },
    error: (message, options) => {
        var _a;
        toast.custom(message, "error", { duration: (_a = options === null || options === void 0 ? void 0 : options.duration) !== null && _a !== void 0 ? _a : 8000 });
    },
    custom: (children, type, options) => {
        react_hot_toast_1.toast.custom((t) => ((0, jsx_runtime_1.jsx)(react_1.Transition, { enter: "transform transition duration-[400ms]", enterFrom: "opacity-0 scale-0", enterTo: "opacity-100 scale-1", leave: "transform duration-200 transition ease-in-out", leaveFrom: "opacity-100 scale-1", leaveTo: "opacity-0 scale-0", show: t.visible, children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white dark:bg-surface-02dp px-4 py-3 drop-shadow-lg rounded-lg overflow-hidden flex flex-row items-center gap-3 text-gray-800 dark:text-neutral-200 max-w-sm sm:max-w-lg w-full break-words", children: [(0, jsx_runtime_1.jsxs)("div", { className: "shrink-0", children: [type == "success" && (0, jsx_runtime_1.jsx)(react_hot_toast_1.CheckmarkIcon, {}), type == "error" && (0, jsx_runtime_1.jsx)(react_hot_toast_1.ErrorIcon, {})] }), (0, jsx_runtime_1.jsx)("div", { className: "flex-1 text-sm max-h-[200px] overflow-auto", children: children }), ((options === null || options === void 0 ? void 0 : options.duration) && (options === null || options === void 0 ? void 0 : options.duration) > 10000) ||
                        (typeof children === "string" && children.length > 50) ? ((0, jsx_runtime_1.jsx)("div", { className: "absolute right-2 top-2 text-gray-600 cursor-button dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300", children: (0, jsx_runtime_1.jsx)(react_2.PopiconsXLine, { className: "w-5 h-5", onClick: () => react_hot_toast_1.toast.dismiss(t.id) }) })) : null] }) })), options);
    },
};
exports.default = toast;
