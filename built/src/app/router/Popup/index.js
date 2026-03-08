"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const client_1 = require("react-dom/client");
require("react-loading-skeleton/dist/skeleton.css");
require("~/app/styles/index.css");
const utils_1 = require("~/app/utils");
require("~/i18n/i18nConfig");
const Popup_1 = __importDefault(require("./Popup"));
// Get the active theme and apply corresponding Tailwind classes to the document
(0, utils_1.setTheme)();
// Occupy full width in Safari Extension on iOS
document.addEventListener("DOMContentLoaded", function () {
    const isSafariOniOS = navigator.userAgent.match(/iPhone/i) &&
        navigator.userAgent.match(/Safari/i);
    const isSafariOniPad = navigator.userAgent.match(/Macintosh/i) &&
        navigator.userAgent.match(/Safari/i) &&
        navigator.maxTouchPoints &&
        navigator.maxTouchPoints > 1;
    if (isSafariOniOS) {
        document.body.classList.remove("w-96");
        document.body.classList.add("w-full");
    }
    if (isSafariOniPad) {
        document.body.classList.remove("max-w-full");
    }
});
const container = document.getElementById("popup-root");
const root = (0, client_1.createRoot)(container);
root.render((0, jsx_runtime_1.jsx)(Popup_1.default, {}));
