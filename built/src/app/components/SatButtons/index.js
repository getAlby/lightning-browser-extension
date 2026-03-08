"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const SatoshiIcon_1 = __importDefault(require("~/app/icons/SatoshiIcon"));
const Button_1 = __importDefault(require("../Button"));
function SatButtons({ onClick, disabled, min, max }) {
    const sizes = [1000, 5000, 10000, 25000];
    return ((0, jsx_runtime_1.jsx)("div", { className: "flex gap-2", children: sizes.map((size) => ((0, jsx_runtime_1.jsx)(Button_1.default, { icon: (0, jsx_runtime_1.jsx)(SatoshiIcon_1.default, { className: "w-4 h-4" }), label: size / 1000 + "k", onClick: () => onClick(size.toString()), fullWidth: true, disabled: disabled ||
                (min != undefined && min > size) ||
                (max != undefined && max < size) }, size))) }));
}
exports.default = SatButtons;
