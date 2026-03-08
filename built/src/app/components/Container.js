"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
function Container({ children, justifyBetween = false, maxWidth = "lg", }) {
    // Avoid dynamically created class strings as PurgeCSS doesn't understand this.
    const getMaxWidthClass = (maxWidth) => {
        switch (maxWidth) {
            case "sm":
                return "max-w-screen-sm";
            case "md":
                return "max-w-screen-md";
            case "lg":
                return "max-w-screen-lg";
            case "xl":
                return "max-w-screen-xl";
            case "2xl":
                return "max-w-screen-2xl";
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: `container mx-auto px-4 pb-4 ${getMaxWidthClass(maxWidth)} ${justifyBetween
            ? "h-full flex flex-col justify-between no-scrollbar"
            : ""}`, children: children }));
}
exports.default = Container;
