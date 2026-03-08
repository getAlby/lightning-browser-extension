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
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const utils_1 = require("../../../utils");
function Input(_a) {
    var { name, id, placeholder, type = "text", required = false, pattern, title, onChange, onFocus, onBlur, value, autoFocus = false, autoComplete = "off", disabled, min, max, suffix, endAdornment, block = true, className } = _a, otherProps = __rest(_a, ["name", "id", "placeholder", "type", "required", "pattern", "title", "onChange", "onFocus", "onBlur", "value", "autoFocus", "autoComplete", "disabled", "min", "max", "suffix", "endAdornment", "block", "className"]);
    const inputEl = (0, react_1.useRef)(null);
    const outerStyles = "rounded-md border border-gray-300 dark:border-neutral-800 transition duration-300 flex-1";
    const inputNode = ((0, jsx_runtime_1.jsx)("input", Object.assign({}, otherProps, { ref: inputEl, type: type, name: name, id: id, className: (0, utils_1.classNames)("placeholder-gray-500 dark:placeholder-neutral-600", block && "block w-full", !suffix && !endAdornment
            ? `${outerStyles} focus:ring-primary focus:border-primary focus:ring-1`
            : "pr-0 border-0 focus:ring-0", disabled
            ? "bg-gray-50 dark:bg-surface-01dp text-gray-500 dark:text-neutral-500"
            : "bg-white dark:bg-black dark:text-white", !!className && className), placeholder: placeholder, required: required, pattern: pattern, title: title, onChange: onChange, onFocus: onFocus, onBlur: onBlur, value: value, autoFocus: autoFocus, autoComplete: autoComplete, disabled: disabled, min: min, max: max })));
    if (!suffix && !endAdornment)
        return inputNode;
    return ((0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.classNames)("flex items-stretch overflow-hidden", !disabled &&
            "focus-within:ring-primary focus-within:border-primary focus-within:dark:border-primary focus-within:ring-1", outerStyles), children: [inputNode, suffix && ((0, jsx_runtime_1.jsx)("span", { className: "flex items-center px-3 font-medium bg-white dark:bg-surface-00dp dark:text-white", onClick: () => {
                    var _a;
                    (_a = inputEl.current) === null || _a === void 0 ? void 0 : _a.focus();
                }, children: suffix })), endAdornment && ((0, jsx_runtime_1.jsx)("span", { className: (0, utils_1.classNames)("flex items-center bg-white dark:bg-black dark:text-neutral-400", !!disabled && "bg-gray-50 dark:bg-surface-01dp"), children: endAdornment }))] }));
}
exports.default = Input;
