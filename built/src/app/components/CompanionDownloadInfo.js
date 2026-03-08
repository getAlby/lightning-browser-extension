"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const os_1 = __importDefault(require("~/common/utils/os"));
function CompanionDownloadInfo({ hasTorCallback }) {
    const [isTor, setIsTor] = (0, react_1.useState)(false);
    const { t } = (0, react_i18next_1.useTranslation)("components", {
        keyPrefix: "companion_download_info",
    });
    function onChangeConnectionMode(isTor) {
        setIsTor(isTor);
        hasTorCallback(isTor);
    }
    // TODO: check if the companion app is already installed
    return ((0, jsx_runtime_1.jsxs)("div", { className: "dark:text-white", children: [(0, jsx_runtime_1.jsx)("h3", { className: "mb-2 font-medium text-gray-800 dark:text-white", children: t("heading") }), (0, jsx_runtime_1.jsxs)("ul", { className: "grid w-full gap-3 md:grid-cols-2", children: [(0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("input", { type: "radio", id: "mode-companion", name: "mode", value: "companion", className: "hidden peer", checked: !isTor, onChange: () => onChangeConnectionMode(false) }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "mode-companion", className: "inline-flex h-full justify-between w-full p-5 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-primary peer-checked:border-primary peer-checked:text-primary hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700", children: (0, jsx_runtime_1.jsxs)("div", { className: "block", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-md font-semibold mb-2", children: t("companion.title") }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm mb-2", children: t("companion.description") }), (0, jsx_runtime_1.jsx)("div", { className: "text-sm", children: (0, jsx_runtime_1.jsxs)("a", { className: "text-sky-500 hover:text-sky-300", href: `https://getalby.com/install/companion/${(0, os_1.default)()}`, target: "_blank", rel: "noreferrer", children: [t("download"), " \u00BB"] }) })] }) })] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("input", { type: "radio", id: "mode-tor", name: "mode", value: "tor", className: "hidden peer", checked: isTor, onChange: () => onChangeConnectionMode(true) }), (0, jsx_runtime_1.jsx)("label", { htmlFor: "mode-tor", className: "inline-flex h-full justify-between w-full p-5 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 dark:peer-checked:text-primary peer-checked:border-primary peer-checked:text-primary hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700", children: (0, jsx_runtime_1.jsxs)("div", { className: "block", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-full font-semibold mb-2", children: t("tor_native.title") }), (0, jsx_runtime_1.jsx)("div", { className: "w-full text-sm mb-2", children: t("tor_native.description") })] }) })] })] })] }));
}
exports.default = CompanionDownloadInfo;
