"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@popicons/react");
const react_2 = require("react");
const utils_1 = require("~/app/utils");
function Alert({ type, children, showClose = false, onClose, }) {
    const [isVisible, setIsVisible] = (0, react_2.useState)(true);
    const handleClose = () => {
        setIsVisible(false);
        if (onClose) {
            onClose();
        }
    };
    if (!isVisible)
        return null;
    return ((0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.classNames)("border rounded-md p-3 flex justify-between relative", type === "warn" &&
            "text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900 border-orange-100 dark:border-orange-900", type === "info" &&
            "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900 border-blue-100 dark:border-blue-900"), children: [showClose && ((0, jsx_runtime_1.jsx)("button", { onClick: handleClose, className: "absolute right-2 top-2 text-gray-600 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300", "aria-label": "Close alert", children: (0, jsx_runtime_1.jsx)(react_1.PopiconsXLine, { className: "w-5 h-5" }) })), (0, jsx_runtime_1.jsx)("div", { className: "pr-8", children: children })] }));
}
exports.default = Alert;
