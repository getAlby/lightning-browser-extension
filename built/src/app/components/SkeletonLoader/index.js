"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_loading_skeleton_1 = __importDefault(require("react-loading-skeleton"));
const utils_1 = require("~/app/utils");
function SkeletonLoader({ className, containerClassName, circle, opaque = true, }) {
    return ((0, jsx_runtime_1.jsx)(react_loading_skeleton_1.default, { baseColor: "#AAA", highlightColor: "#FFF", className: (0, utils_1.classNames)(opaque ? "opacity-20" : "", className !== null && className !== void 0 ? className : ""), containerClassName: containerClassName, circle: circle }));
}
exports.default = SkeletonLoader;
