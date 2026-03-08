"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@popicons/react");
const i18next_1 = require("i18next");
const Toast_1 = __importDefault(require("~/app/components/Toast"));
const utils_1 = require("~/app/utils");
function InputCopyButton({ value, className }) {
    return ((0, jsx_runtime_1.jsx)("button", { type: "button", tabIndex: -1, className: (0, utils_1.classNames)("flex justify-center items-center h-8 w-10", "text-gray-400 dark:text-neutral-600 hover:text-gray-600 hover:dark:text-neutral-400", !!className && className), onClick: () => __awaiter(this, void 0, void 0, function* () {
            try {
                navigator.clipboard.writeText(value);
                Toast_1.default.success((0, i18next_1.t)("common:actions.copied_to_clipboard"));
            }
            catch (e) {
                if (e instanceof Error) {
                    Toast_1.default.error(e.message);
                }
            }
        }), children: (0, jsx_runtime_1.jsx)(react_1.PopiconsCopyLine, { className: "w-6 h-6" }) }));
}
exports.default = InputCopyButton;
