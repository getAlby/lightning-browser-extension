"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
function Checkbox({ id, name, checked, onChange, disabled, }) {
    return ((0, jsx_runtime_1.jsx)("input", { id: id, name: name, type: "checkbox", checked: checked, onChange: onChange, disabled: disabled, className: "h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer" }));
}
exports.default = Checkbox;
