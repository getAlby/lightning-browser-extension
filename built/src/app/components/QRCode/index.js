"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_qr_code_1 = __importDefault(require("react-qr-code"));
const utils_1 = require("~/app/utils");
function QRCode({ value, size, level, className }) {
    const theme = (0, utils_1.useTheme)();
    const fgColor = theme === "dark" ? "#FFFFFF" : "#000000";
    const bgColor = theme === "dark" ? "#000000" : "#FFFFFF";
    return ((0, jsx_runtime_1.jsx)(react_qr_code_1.default, { value: value, size: size, fgColor: fgColor, bgColor: bgColor, className: (0, utils_1.classNames)("w-full h-auto rounded-md", className !== null && className !== void 0 ? className : ""), level: level }));
}
exports.default = QRCode;
