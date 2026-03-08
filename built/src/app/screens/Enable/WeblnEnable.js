"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const WeblnEnable_1 = __importDefault(require("~/app/components/Enable/WeblnEnable"));
function WeblnEnable(props) {
    return (0, jsx_runtime_1.jsx)(WeblnEnable_1.default, { origin: props.origin });
}
exports.default = WeblnEnable;
