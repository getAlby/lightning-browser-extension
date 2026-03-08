"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@popicons/react");
const react_modal_1 = __importDefault(require("react-modal"));
const utils_1 = require("~/app/utils");
function Modal({ children, isOpen, close: closeModal, contentLabel, title, position = "center", className = "p-5", }) {
    return ((0, jsx_runtime_1.jsxs)(react_modal_1.default, { ariaHideApp: false, closeTimeoutMS: 200, shouldFocusAfterRender: false, isOpen: isOpen, onRequestClose: closeModal, contentLabel: contentLabel, overlayClassName: (0, utils_1.classNames)("bg-black bg-opacity-50 fixed inset-0 flex justify-center cursor-pointer", position == "center" && "items-center", position == "top" && "items-start pt-20"), className: (0, utils_1.classNames)(className, "rounded-xl shadow-xl bg-white dark:bg-surface-01dp w-full max-w-md overflow-x-hidden relative cursor-auto mx-5 no-scrollbar"), style: { content: { maxHeight: "80vh" } }, children: [title && ((0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold text-center dark:text-white pb-5", children: title })), (0, jsx_runtime_1.jsx)("button", { onClick: closeModal, className: "absolute right-5 top-5 text-gray-600 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-300", children: (0, jsx_runtime_1.jsx)(react_1.PopiconsXLine, { className: "w-5 h-5" }) }), children] }));
}
exports.default = Modal;
