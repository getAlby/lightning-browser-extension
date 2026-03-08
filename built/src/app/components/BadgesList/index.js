"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const Badge_1 = __importDefault(require("@components/Badge"));
const react_i18next_1 = require("react-i18next");
function BadgesList({ allowance }) {
    const { t: tComponents } = (0, react_i18next_1.useTranslation)("components", {
        keyPrefix: "badge",
    });
    const badges = [];
    if (allowance.remainingBudget > 0) {
        badges.push({
            label: "budget",
            className: "bg-blue-500 text-white mr-2",
        });
    }
    if (allowance.lnurlAuth) {
        badges.push({
            label: "auth",
            className: "bg-green-bitcoin text-white mr-2",
        });
    }
    return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: badges === null || badges === void 0 ? void 0 : badges.map((b) => {
            return ((0, jsx_runtime_1.jsx)(Badge_1.default, { label: tComponents(`label.${b.label}`), className: b.className }, b.label));
        }) }));
}
exports.default = BadgesList;
