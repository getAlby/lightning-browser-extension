"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const Input_1 = __importDefault(require("../Input"));
const TextField = ({ autoComplete = "off", autoFocus = false, disabled, endAdornment, hint, id, label, max, maxLength, min, minLength, onBlur, onChange, onFocus, pattern, placeholder, required = false, readOnly = false, suffix, title, type = "text", tabIndex, value, }) => ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: id, className: "font-medium text-gray-800 dark:text-white", children: label }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-1 flex flex-col flex-1", children: [(0, jsx_runtime_1.jsx)(Input_1.default, { autoComplete: autoComplete, autoFocus: autoFocus, disabled: disabled, endAdornment: endAdornment, id: id, max: max, maxLength: maxLength, min: min, minLength: minLength, name: id, onBlur: onBlur, onChange: onChange, onFocus: onFocus, pattern: pattern, placeholder: placeholder, required: required, suffix: suffix, title: title, type: type, value: value, tabIndex: tabIndex, readOnly: readOnly }), hint && ((0, jsx_runtime_1.jsx)("p", { className: "my-1 text-xs text-gray-700 dark:text-neutral-400", children: hint }))] })] }));
exports.default = TextField;
