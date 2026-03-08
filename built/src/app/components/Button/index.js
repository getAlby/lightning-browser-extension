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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Loading_1 = __importDefault(require("~/app/components/Loading"));
const index_1 = require("~/app/utils/index");
const Button = (0, react_1.forwardRef)((_a, ref) => {
    var { type = "button", label, onClick, disabled, direction = "row", icon, iconRight, fullWidth = false, halfWidth = false, primary = false, outline = false, loading = false, destructive = false, flex = false, className } = _a, otherProps = __rest(_a, ["type", "label", "onClick", "disabled", "direction", "icon", "iconRight", "fullWidth", "halfWidth", "primary", "outline", "loading", "destructive", "flex", "className"]);
    return ((0, jsx_runtime_1.jsxs)("button", Object.assign({}, otherProps, { ref: ref, type: type, className: (0, index_1.classNames)(direction === "row" ? "flex-row" : "flex-col", fullWidth && "w-full", halfWidth && "w-1/2 first:mr-2 last:ml-2", fullWidth || halfWidth ? "px-0 py-2" : "px-7 py-2", primary
            ? "bg-primary-gradient border-2 border-transparent text-black"
            : outline
                ? "bg-white text-gray-700 border-2 border-primary dark:text-primary dark:bg-surface-02dp"
                : destructive
                    ? "bg-white text-red-700 dark:text-red-300 border-2 border-transparent dark:bg-surface-02dp"
                    : `bg-white text-gray-700 dark:bg-surface-02dp dark:text-neutral-200 dark:border-neutral-800`, primary && !disabled && "hover:bg-primary-gradient-hover", !primary &&
            !disabled &&
            "hover:bg-gray-50 dark:hover:bg-surface-16dp", disabled ? "cursor-default opacity-60" : "cursor-pointer", flex && "flex-1", "inline-flex justify-center items-center gap-1 font-medium bg-origin-border shadow rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary transition duration-150 whitespace-nowrap", !!className && className), onClick: onClick, disabled: disabled, children: [loading && ((0, jsx_runtime_1.jsx)("div", { className: direction === "row" ? "mr-2" : "", children: (0, jsx_runtime_1.jsx)(Loading_1.default, { color: primary ? "white" : "black" }) })), icon, label, iconRight] })));
});
Button.displayName = "Button";
exports.default = Button;
