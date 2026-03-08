"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const i18nConfig_1 = __importDefault(require("~/i18n/i18nConfig"));
const Button_1 = __importDefault(require("../Button"));
function ConnectorForm({ title, description, submitLabel = i18nConfig_1.default.t("common:actions.continue"), submitLoading = false, submitDisabled = false, onSubmit, children, video, image, logo, }) {
    const media = ((0, jsx_runtime_1.jsxs)("div", { className: "flex h-full justify-center items-center", children: [video && ((0, jsx_runtime_1.jsx)("div", { className: "flex-1 relative h-0", style: { paddingBottom: "56.25%" }, children: (0, jsx_runtime_1.jsx)("video", { className: "absolute t-0 l-0 w-full h-full", controls: true, children: (0, jsx_runtime_1.jsx)("source", { src: video, type: "video/mp4" }) }) })), image && ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)("div", { className: "w-96", children: (0, jsx_runtime_1.jsx)("img", { src: image, alt: "Screenshot", className: "block w-full rounded-md" }) }) }))] }));
    return ((0, jsx_runtime_1.jsx)("form", { onSubmit: onSubmit, children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col max-w-xl mx-auto mt-6 relative bg-white dark:bg-surface-02dp p-10 rounded-2xl border border-gray-200 dark:border-neutral-700 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [logo && (0, jsx_runtime_1.jsx)("img", { src: logo, className: "w-16 mr-4 rounded-lg" }), typeof title === "string" ? ((0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold dark:text-white", children: title })) : (title)] }), description && ((0, jsx_runtime_1.jsx)("div", { className: "text-gray-700 dark:text-white whitespace-pre-line", children: typeof description === "string" ? ((0, jsx_runtime_1.jsx)("p", { className: "mb-6", children: description })) : (description) })), video || (image && media), (0, jsx_runtime_1.jsx)("div", { children: children }), (0, jsx_runtime_1.jsx)("div", { className: "mt-4 flex justify-center", children: (0, jsx_runtime_1.jsx)(Button_1.default, { type: "submit", label: submitLabel, loading: submitLoading, disabled: submitDisabled, primary: true, className: "w-64" }) })] }) }));
}
exports.default = ConnectorForm;
