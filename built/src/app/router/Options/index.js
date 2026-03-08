"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const client_1 = require("react-dom/client");
require("react-loading-skeleton/dist/skeleton.css");
const react_modal_1 = __importDefault(require("react-modal"));
require("~/app/styles/index.css");
const utils_1 = require("~/app/utils");
require("~/i18n/i18nConfig");
const Options_1 = __importDefault(require("./Options"));
// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
react_modal_1.default.setAppElement("#options-root");
// Get the active theme and apply corresponding Tailwind classes to the document
(0, utils_1.setTheme)();
const container = document.getElementById("options-root");
const root = (0, client_1.createRoot)(container);
root.render((0, jsx_runtime_1.jsx)(Options_1.default, {}));
